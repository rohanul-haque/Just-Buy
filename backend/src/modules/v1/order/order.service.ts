import config from "@/config";
import stripe from "@/lib/stripe";
import Cart from "@/modules/v1/cart/cart.model";
import {
  DEFAULT_COMMISSION_RATE,
  DEFAULT_SHIPPING_CHARGE,
  ORDER_MESSAGES,
  OrderStatus,
  OrderType,
  VALID_ORDER_STATUS_TRANSITIONS,
} from "@/modules/v1/order/order.constant";
import type {
  ICreateOrderInput,
  ICreateOrderResult,
  IOrder,
  IOrderItem,
  IOrderQueryOptions,
  IPaginatedOrdersResult,
  IUpdateOrderStatusInput,
} from "@/modules/v1/order/order.interface";
import Order from "@/modules/v1/order/order.model";
import {
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
} from "@/modules/v1/payment/payment.constant";
import Payment from "@/modules/v1/payment/payment.model";
import paymentService from "@/modules/v1/payment/payment.service";
import Product from "@/modules/v1/product/product.model";
import { UserRole, type TUserRole } from "@/modules/v1/user/user.constant";
import { VendorStatus } from "@/modules/v1/vendor/vendor.constant";
import Vendor from "@/modules/v1/vendor/vendor.model";
import AppError from "@/utils/AppError";
import ERROR_CODE from "@/utils/ERROR_CODES";
import MESSAGES from "@/utils/MESSAGE";
import crypto from "crypto";
import { status } from "http-status";
import type { ClientSession } from "mongoose";
import mongoose from "mongoose";

const runInTransaction = async <T>(
  work: (session?: ClientSession) => Promise<T>,
): Promise<T> => {
  let session: ClientSession | undefined;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const result = await work(session);
    await session.commitTransaction();
    return result;
  } catch (error: any) {
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }
    // Fallback if local MongoDB is standalone without replica set
    if (
      error?.message?.includes("replica set") ||
      error?.message?.includes("standalone") ||
      error?.code === 20 ||
      error?.codeName === "IllegalOperation"
    ) {
      return await work(undefined);
    }
    throw error;
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

const generateTransactionNumber = (): string => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomHex = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `TXN-${dateStr}-${randomHex}`;
};

const createOrder = async (
  buyerId: string,
  payload: ICreateOrderInput,
): Promise<ICreateOrderResult> => {
  const orderType = payload.orderType || OrderType.COD;

  // 1. Retrieve the Buyer's Cart
  const cart = await Cart.findOne({ buyer: buyerId }).exec();

  if (!cart || cart.productItems.length === 0) {
    throw new AppError(
      status.BAD_REQUEST,
      ERROR_CODE.BAD_REQUEST,
      ORDER_MESSAGES.CART_EMPTY,
    );
  }

  // 2. Perform Order creation, stock deduction/reservation, and Payment creation atomically
  const { newOrder, newPayment } = await runInTransaction(async (session) => {
    const orderItems: IOrderItem[] = [];

    for (const item of cart.productItems) {
      // Find active product
      const productQuery = Product.findOne({
        _id: item.product,
        isActive: true,
      });
      if (session) {
        productQuery.session(session);
      }
      const product = await productQuery.exec();

      if (!product) {
        throw new AppError(
          status.NOT_FOUND,
          ERROR_CODE.PRODUCT_NOT_FOUND,
          `${MESSAGES.PRODUCT_NOT_FOUND} (ID: ${item.product.toString()})`,
        );
      }

      // Validate size if product has size options
      if (product.sizes && product.sizes.length > 0) {
        if (!item.size || !product.sizes.includes(item.size)) {
          throw new AppError(
            status.BAD_REQUEST,
            ERROR_CODE.VALIDATION_ERROR,
            `Selected size is not available for ${product.name}`,
          );
        }
      }

      // Check stock
      if (item.quantity > product.stock) {
        throw new AppError(
          status.BAD_REQUEST,
          ERROR_CODE.CART_ITEM_OUT_OF_STOCK,
          `Requested quantity for ${product.name} exceeds available stock (${product.stock})`,
        );
      }

      // Deduct stock atomically to prevent race conditions & overselling
      const updateQuery = Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true },
      );
      if (session) {
        updateQuery.session(session);
      }
      const updatedProduct = await updateQuery.exec();

      if (!updatedProduct) {
        throw new AppError(
          status.BAD_REQUEST,
          ERROR_CODE.CART_ITEM_OUT_OF_STOCK,
          `Insufficient stock for ${product.name}`,
        );
      }

      // Calculate financial values for this item
      const itemSubtotal = Number((product.price * item.quantity).toFixed(2));
      const adminCommission = Number(
        ((itemSubtotal * DEFAULT_COMMISSION_RATE) / 100).toFixed(2),
      );
      const vendorEarning = Number((itemSubtotal - adminCommission).toFixed(2));

      // Construct historical snapshot
      orderItems.push({
        product: product._id,
        vendor: product.vendor,
        name: product.name,
        image: product.featureImage?.url || (product.images?.[0]?.url ?? ""),
        brand: product.brand || "",
        unitPrice: product.price,
        quantity: item.quantity,
        size: item.size,
        itemSubtotal,
        commissionRate: DEFAULT_COMMISSION_RATE,
        adminCommission,
        vendorEarning,
      });
    }

    // Ensure all items in the order belong to a single vendor
    const vendorIds = [
      ...new Set(orderItems.map((item) => item.vendor.toString())),
    ];

    if (vendorIds.length > 1) {
      throw new AppError(
        status.BAD_REQUEST,
        ERROR_CODE.BAD_REQUEST,
        "Cart contains products from multiple vendors. Each order must belong to a single vendor.",
      );
    }

    const orderVendor = orderItems[0].vendor;

    // Calculate order-level financial values
    const subtotal = Number(
      orderItems.reduce((sum, item) => sum + item.itemSubtotal, 0).toFixed(2),
    );
    const shippingCharge = DEFAULT_SHIPPING_CHARGE;
    const totalAmount = Number((subtotal + shippingCharge).toFixed(2));
    const transactionNumber = generateTransactionNumber();

    // Create Order document
    const [createdOrder] = await Order.create(
      [
        {
          buyer: buyerId,
          vendor: orderVendor,
          transactionNumber,
          orderType,
          shippingAddress: payload.shippingAddress,
          productItems: orderItems,
          subtotal,
          shippingCharge,
          totalAmount,
          status: OrderStatus.PENDING,
        },
      ],
      { session },
    );

    // Create Payment record
    const paymentMethod =
      orderType === OrderType.ONLINE ? PaymentMethod.ONLINE : PaymentMethod.COD;
    const provider =
      orderType === OrderType.ONLINE
        ? PaymentProvider.STRIPE
        : PaymentProvider.COD;
    const paymentStatus =
      orderType === OrderType.ONLINE
        ? PaymentStatus.PENDING
        : PaymentStatus.UNPAID;

    const [createdPayment] = await Payment.create(
      [
        {
          order: createdOrder._id,
          buyer: buyerId,
          paymentMethod,
          provider,
          amount: totalAmount,
          currency: config.STRIPE_CURRENCY,
          status: paymentStatus,
        },
      ],
      { session },
    );

    // Link payment to order
    createdOrder.payment = createdPayment._id;
    if (session) {
      await createdOrder.save({ session });
    } else {
      await createdOrder.save();
    }

    // For COD: clear the cart immediately
    if (orderType === OrderType.COD) {
      cart.productItems = [];
      if (session) {
        await cart.save({ session });
      } else {
        await cart.save();
      }
    }

    return { newOrder: createdOrder, newPayment: createdPayment };
  });

  // Populate order details
  await newOrder.populate([
    { path: "vendor", select: "shopName location profile" },
    { path: "productItems.vendor", select: "shopName location profile" },
    {
      path: "payment",
      select: "paymentMethod provider amount currency status paidAt",
    },
  ]);

  // For ONLINE payment: initiate Stripe Checkout session outside transaction
  if (orderType === OrderType.ONLINE) {
    try {
      const checkoutSession = await paymentService.createStripeCheckoutSession(
        newOrder,
        newPayment,
        buyerId,
      );

      return {
        order: newOrder,
        payment: newPayment,
        checkoutUrl: checkoutSession.checkoutUrl,
        sessionId: checkoutSession.sessionId,
      };
    } catch (stripeError) {
      // Rollback stock reservation and mark order cancelled on failure
      const items = newOrder.productItems || (newOrder as any).items || [];
      for (const item of items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        }).exec();
      }
      newOrder.status = OrderStatus.CANCELLED;
      await newOrder.save();
      newPayment.status = PaymentStatus.FAILED;
      await newPayment.save();

      throw stripeError;
    }
  }

  return {
    order: newOrder,
    payment: newPayment,
  };
};

const getMyOrders = async (
  buyerId: string,
  options: IOrderQueryOptions,
): Promise<IPaginatedOrdersResult> => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skipCount = options.skip ?? (page - 1) * limit;

  const filter: Record<string, any> = { buyer: buyerId };
  if (options.status) {
    filter.status = options.status;
  }
  if (options.orderType) {
    filter.orderType = options.orderType;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skipCount)
      .limit(limit)
      .populate("vendor", "shopName location profile")
      .populate("productItems.vendor", "shopName location profile")
      .populate(
        "payment",
        "paymentMethod provider amount currency status paidAt",
      )
      .exec(),
    Order.countDocuments(filter).exec(),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data: orders,
    pagination: {
      page,
      limit,
      skip: skipCount,
      total,
      totalPages,
      hasPrevPage: options.skip !== undefined ? skipCount > 0 : page > 1,
      hasNextPage: skipCount + limit < total,
    },
  };
};

const getOrderById = async (
  user: { userId: string; role: TUserRole } | string,
  orderId: string,
): Promise<IOrder> => {
  const userId = typeof user === "string" ? user : user.userId;
  const role = typeof user === "string" ? UserRole.BUYER : user.role;

  const order = await Order.findById(orderId)
    .populate("vendor", "shopName location profile")
    .populate("productItems.vendor", "shopName location profile")
    .populate("payment", "paymentMethod provider amount currency status paidAt")
    .exec();

  if (!order) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.ORDER_NOT_FOUND,
      MESSAGES.ORDER_NOT_FOUND,
    );
  }

  // Authorization checks
  if (role === UserRole.ADMIN) {
    return order;
  }

  if (role === UserRole.BUYER) {
    if (order.buyer.toString() !== userId) {
      throw new AppError(
        status.FORBIDDEN,
        ERROR_CODE.FORBIDDEN,
        "You do not have permission to view this order",
      );
    }
    return order;
  }

  if (role === UserRole.VENDOR) {
    const vendor = await Vendor.findOne({ vendor: userId }).exec();
    if (!vendor) {
      throw new AppError(
        status.NOT_FOUND,
        ERROR_CODE.SELLER_PROFILE_NOT_FOUND,
        MESSAGES.SELLER_PROFILE_NOT_FOUND,
      );
    }

    const orderVendorId = (order.vendor as any)?._id || order.vendor;
    if (orderVendorId.toString() !== vendor._id.toString()) {
      throw new AppError(
        status.FORBIDDEN,
        ERROR_CODE.FORBIDDEN,
        "You do not have permission to view this order",
      );
    }

    return order;
  }

  throw new AppError(
    status.FORBIDDEN,
    ERROR_CODE.FORBIDDEN,
    "You do not have permission to view this order",
  );
};

const cancelOrder = async (
  buyerId: string,
  orderId: string,
): Promise<IOrder> => {
  const order = await Order.findById(orderId).exec();

  if (!order) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.ORDER_NOT_FOUND,
      MESSAGES.ORDER_NOT_FOUND,
    );
  }

  if (order.buyer.toString() !== buyerId) {
    throw new AppError(
      status.FORBIDDEN,
      ERROR_CODE.FORBIDDEN,
      "You do not have permission to cancel this order",
    );
  }

  if (order.status === OrderStatus.CANCELLED) {
    throw new AppError(
      status.BAD_REQUEST,
      ERROR_CODE.ORDER_ALREADY_CANCELLED,
      ORDER_MESSAGES.ORDER_ALREADY_CANCELLED,
    );
  }

  const payment = await Payment.findOne({ order: order._id }).exec();

  // Prevent cancellation of paid Orders
  if (payment && payment.status === PaymentStatus.PAID) {
    throw new AppError(
      status.BAD_REQUEST,
      ERROR_CODE.ORDER_CANNOT_BE_CANCELLED,
      "Paid orders cannot be cancelled directly. Please contact support.",
    );
  }

  if (order.status !== OrderStatus.PENDING) {
    throw new AppError(
      status.BAD_REQUEST,
      ERROR_CODE.ORDER_CANNOT_BE_CANCELLED,
      ORDER_MESSAGES.ORDER_CANNOT_BE_CANCELLED,
    );
  }

  // Restore stock and update status inside transaction
  await runInTransaction(async (session) => {
    const items = order.productItems || (order as any).items || [];
    for (const item of items) {
      const updateQuery = Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } },
        { new: true },
      );
      if (session) {
        updateQuery.session(session);
      }
      await updateQuery.exec();
    }

    order.status = OrderStatus.CANCELLED;

    if (session) {
      await order.save({ session });
    } else {
      await order.save();
    }

    if (payment && payment.status !== PaymentStatus.PAID) {
      payment.status = PaymentStatus.FAILED;
      if (session) {
        await payment.save({ session });
      } else {
        await payment.save();
      }
    }
  });

  // Expire active Stripe Checkout Session if exists
  if (payment?.stripeSessionId) {
    try {
      await stripe.checkout.sessions.expire(payment.stripeSessionId);
    } catch {
      // Ignored if session is already expired or closed
    }
  }

  return (await order.populate([
    { path: "vendor", select: "shopName location profile" },
    { path: "productItems.vendor", select: "shopName location profile" },
    {
      path: "payment",
      select: "paymentMethod provider amount currency status paidAt",
    },
  ])) as IOrder;
};

const updateOrderStatus = async (
  orderId: string,
  payload: IUpdateOrderStatusInput,
  user: { userId: string; role: TUserRole },
): Promise<IOrder> => {
  const order = await Order.findById(orderId).exec();

  if (!order) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.ORDER_NOT_FOUND,
      ORDER_MESSAGES.ORDER_NOT_FOUND,
    );
  }

  // Verify Vendor Ownership or Admin Authorization
  if (user.role === UserRole.VENDOR) {
    const vendor = await Vendor.findOne({ vendor: user.userId }).exec();

    if (!vendor) {
      throw new AppError(
        status.NOT_FOUND,
        ERROR_CODE.SELLER_PROFILE_NOT_FOUND,
        MESSAGES.SELLER_PROFILE_NOT_FOUND,
      );
    }

    if (vendor.status !== VendorStatus.APPROVED) {
      throw new AppError(
        status.FORBIDDEN,
        ERROR_CODE.SELLER_NOT_APPROVED,
        MESSAGES.SELLER_CANNOT_CREATE_PRODUCT,
      );
    }

    const orderVendorId = (order.vendor as any)?._id || order.vendor;
    if (orderVendorId.toString() !== vendor._id.toString()) {
      throw new AppError(
        status.FORBIDDEN,
        ERROR_CODE.FORBIDDEN,
        ORDER_MESSAGES.ORDER_UNAUTHORIZED,
      );
    }
  } else if (user.role !== UserRole.ADMIN) {
    throw new AppError(
      status.FORBIDDEN,
      ERROR_CODE.FORBIDDEN,
      MESSAGES.FORBIDDEN,
    );
  }

  // Avoid unnecessary database writes when requested status is unchanged
  if (order.status === payload.status) {
    return (await order.populate([
      { path: "vendor", select: "shopName location profile" },
      { path: "productItems.vendor", select: "shopName location profile" },
      {
        path: "payment",
        select: "paymentMethod provider amount currency status paidAt",
      },
    ])) as IOrder;
  }

  // Prevent transitions from terminal states
  if (order.status === OrderStatus.DELIVERED) {
    throw new AppError(
      status.BAD_REQUEST,
      ERROR_CODE.BAD_REQUEST,
      ORDER_MESSAGES.ORDER_ALREADY_TERMINAL,
    );
  }

  if (order.status === OrderStatus.CANCELLED) {
    throw new AppError(
      status.BAD_REQUEST,
      ERROR_CODE.BAD_REQUEST,
      ORDER_MESSAGES.ORDER_ALREADY_TERMINAL,
    );
  }

  // Validate status transition
  const allowedTransitions = VALID_ORDER_STATUS_TRANSITIONS[order.status] || [];
  if (!allowedTransitions.includes(payload.status)) {
    throw new AppError(
      status.BAD_REQUEST,
      ERROR_CODE.BAD_REQUEST,
      `Invalid status transition from ${order.status} to ${payload.status}`,
    );
  }

  await runInTransaction(async (session) => {
    // If order is cancelled, restore stock for all items
    if (payload.status === OrderStatus.CANCELLED) {
      for (const item of order.productItems) {
        const updateProduct = Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } },
          { new: true },
        );
        if (session) {
          updateProduct.session(session);
        }
        await updateProduct.exec();
      }

      const payment = await Payment.findOne({ order: order._id }).exec();
      if (payment && payment.status !== PaymentStatus.PAID) {
        payment.status = PaymentStatus.FAILED;
        if (session) {
          await payment.save({ session });
        } else {
          await payment.save();
        }
      }
    }

    order.status = payload.status;

    if (session) {
      await order.save({ session });
    } else {
      await order.save();
    }
  });

  if (payload.status === OrderStatus.CANCELLED) {
    const payment = await Payment.findOne({ order: order._id }).exec();
    if (payment?.stripeSessionId) {
      try {
        await stripe.checkout.sessions.expire(payment.stripeSessionId);
      } catch {
        // Ignored
      }
    }
  }

  return (await order.populate([
    { path: "vendor", select: "shopName location profile" },
    { path: "productItems.vendor", select: "shopName location profile" },
    {
      path: "payment",
      select: "paymentMethod provider amount currency status paidAt",
    },
  ])) as IOrder;
};

const getAllOrders = async (
  options: IOrderQueryOptions,
): Promise<IPaginatedOrdersResult> => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skipCount = options.skip ?? (page - 1) * limit;

  const filter: Record<string, any> = {};
  if (options.status) {
    filter.status = options.status;
  }
  if (options.orderType) {
    filter.orderType = options.orderType;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skipCount)
      .limit(limit)
      .populate("buyer", "name email")
      .populate("vendor", "shopName location profile")
      .populate("productItems.vendor", "shopName location profile")
      .populate(
        "payment",
        "paymentMethod provider amount currency status paidAt",
      )
      .exec(),
    Order.countDocuments(filter).exec(),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data: orders,
    pagination: {
      page,
      limit,
      skip: skipCount,
      total,
      totalPages,
      hasPrevPage: options.skip !== undefined ? skipCount > 0 : page > 1,
      hasNextPage: skipCount + limit < total,
    },
  };
};

const getVendorOrders = async (
  vendorUserId: string,
  options: IOrderQueryOptions,
): Promise<IPaginatedOrdersResult> => {
  const vendor = await Vendor.findOne({ vendor: vendorUserId }).exec();
  if (!vendor) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.SELLER_PROFILE_NOT_FOUND,
      MESSAGES.SELLER_PROFILE_NOT_FOUND,
    );
  }

  const page = options.page || 1;
  const limit = options.limit || 10;
  const skipCount = options.skip ?? (page - 1) * limit;

  const filter: Record<string, any> = { vendor: vendor._id };
  if (options.status) {
    filter.status = options.status;
  }
  if (options.orderType) {
    filter.orderType = options.orderType;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skipCount)
      .limit(limit)
      .populate("buyer", "name email")
      .populate("vendor", "shopName location profile")
      .populate("productItems.vendor", "shopName location profile")
      .populate(
        "payment",
        "paymentMethod provider amount currency status paidAt",
      )
      .exec(),
    Order.countDocuments(filter).exec(),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data: orders,
    pagination: {
      page,
      limit,
      skip: skipCount,
      total,
      totalPages,
      hasPrevPage: options.skip !== undefined ? skipCount > 0 : page > 1,
      hasNextPage: skipCount + limit < total,
    },
  };
};

const orderService = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
  getVendorOrders,
};

export default orderService;
