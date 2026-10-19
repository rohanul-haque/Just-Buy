/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-party Modules
 */
import { Types } from "mongoose";

/**
 * Application Modules
 */
import AppError from "@/utils/appError";
import { API_MESSAGES, ERROR_CODE, HTTP_STATUS } from "@/utils/constants";

/**
 * Models
 */
import User from "@/modules/v1/auth/auth.model";
import Buyer from "@/modules/v1/buyer/buyer.model";
import Cart from "@/modules/v1/cart/cart.model";
import Order from "@/modules/v1/order/order.model";
import Product from "@/modules/v1/product/product.model";

/**
 * Types
 */
import type {
  CreateOrderInput,
  IOrderItem,
  IVendorOrderResponse,
  OrderStatus,
} from "@/modules/v1/order/order.interface";
import type { IAvatar } from "@/modules/v1/seller/seller.interface";

/**
 * Service for create new order
 * @param buyerId - Buyer ID
 * @param payload - Order payload
 * @returns Promise<void>
 */
export const createOrderService = async (
  buyerId: Types.ObjectId,
  payload: CreateOrderInput,
): Promise<void> => {
  const cart = await Cart.findOne({ buyer: buyerId });

  if (!cart || cart.items.length === 0) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODE.CART_ITEM_NOT_FOUND,
      API_MESSAGES.CART_ITEM_NOT_FOUND,
    );
  }

  const items: IOrderItem[] = [];

  for (const cartItem of cart.items) {
    const product = await Product.findById(cartItem.product);

    if (!product) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODE.CART_ITEM_NOT_FOUND,
        API_MESSAGES.CART_ITEM_NOT_FOUND,
      );
    }

    if (!product.seller) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODE.SELLER_PROFILE_NOT_FOUND,
        API_MESSAGES.SELLER_PROFILE_NOT_FOUND,
      );
    }

    items.push({
      product: product._id,
      seller: product.seller,
      name: product.name,
      images: product.images.map((image: IAvatar) => ({
        publicId: image.publicId,
        url: image.url,
        width: image.width ?? null,
        height: image.height ?? null,
      })),
      price: product.price,
      quantity: cartItem.quantity,
    });
  }

  // Calculate the order amount
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const shippingFee = subtotal > 0 ? 100 : 0;

  const total = subtotal;
  // Save the order
  const order = await Order.create({
    buyer: buyerId,
    items,
    shippingAddress: payload.shippingAddress,
    subtotal,
    shippingFee,
    total,
    paymentMethod: payload.paymentMethod,
  });

  // Clear the cart after creating the order
  await Cart.deleteOne({ _id: cart._id, buyer: buyerId });
};

/**
 * Service for update order status
 * @param orderId - Order ID
 * @param status - Order status
 * @returns Promise<void>
 */
export const updateOrderStatusService = async (
  orderId: Types.ObjectId,
  status: OrderStatus,
): Promise<void> => {
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    {
      $set: { orderStatus: status },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedOrder) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.ORDER_NOT_FOUND,
      API_MESSAGES.ORDER_NOT_FOUND,
    );
  }
};

/**
 * Service to get all orders for a specific vendor
 * @param sellerId - Seller / Vendor User ID
 * @returns {Promise<IVendorOrderResponse[]>}
 */
export const getVendorOrdersService = async (
  sellerId: Types.ObjectId,
): Promise<IVendorOrderResponse[]> => {
  const orders = await Order.find({
    "items.seller": sellerId,
  })
    .select("buyer items orderStatus total createdAt shippingAddress")
    .sort({ createdAt: -1 })
    .lean();

  if (orders.length === 0) {
    return [];
  }

  // Collect all buyer IDs
  const buyerIds = orders.map((order) => order.buyer).filter(Boolean);

  // Fetch Buyer profiles and Users in parallel
  const [buyers, users] = await Promise.all([
    Buyer.find({
      $or: [{ user: { $in: buyerIds } }, { _id: { $in: buyerIds } }],
    })
      .populate("user", "fullName email")
      .lean(),
    User.find({
      _id: { $in: buyerIds },
    })
      .select("fullName email")
      .lean(),
  ]);

  // Create a lookup map for buyer info
  const buyerMap = new Map<
    string,
    {
      name: string;
      avatar: IAvatar | null;
    }
  >();

  // Map users first
  users.forEach((user: any) => {
    buyerMap.set(user._id.toString(), {
      name: user.fullName || "",
      avatar: null,
    });
  });

  // Map buyer profiles (containing avatar and populated user.fullName)
  buyers.forEach((buyer: any) => {
    const userName =
      buyer.user?.fullName ||
      (buyer.user?._id ? buyerMap.get(buyer.user._id.toString())?.name : "") ||
      "";

    const avatar: IAvatar | null = buyer.avatar?.url
      ? {
          publicId: buyer.avatar.publicId || "",
          url: buyer.avatar.url,
          width: buyer.avatar.width ?? null,
          height: buyer.avatar.height ?? null,
        }
      : null;

    const data = {
      name: userName,
      avatar,
    };

    if (buyer.user?._id) {
      buyerMap.set(buyer.user._id.toString(), data);
    }
    buyerMap.set(buyer._id.toString(), data);
  });

  return orders.map((order: any) => {
    const vendorItems = order.items.filter(
      (item: any) => item.seller?.toString() === sellerId.toString(),
    );

    const buyerInfo = buyerMap.get(order.buyer?.toString());
    const buyerName =
      buyerInfo?.name || order.shippingAddress?.fullName || "Customer";
    const buyerAvatar = buyerInfo?.avatar || null;

    return {
      _id: order._id,
      buyer: {
        _id: order.buyer,
        name: buyerName,
        avatar: buyerAvatar,
      },
      items: vendorItems.map((item: any) => ({
        productId: item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      orderStatus: order.orderStatus,
      total: order.total,
      createdAt: order.createdAt,
    };
  });
};
