import config from "@/config";
import stripe from "@/lib/stripe";
import Cart from "@/modules/v1/cart/cart.model";
import {
  ORDER_MESSAGES,
  OrderStatus,
  OrderType,
} from "@/modules/v1/order/order.constant";
import type { IOrder } from "@/modules/v1/order/order.interface";
import Order from "@/modules/v1/order/order.model";
import {
  PAYMENT_MESSAGES,
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
} from "@/modules/v1/payment/payment.constant";
import type {
  ICreatePaymentInput,
  IPayment,
  IStripeCheckoutSessionResult,
  IVerifySessionResult,
} from "@/modules/v1/payment/payment.interface";
import Payment from "@/modules/v1/payment/payment.model";
import Product from "@/modules/v1/product/product.model";
import { UserRole } from "@/modules/v1/user/user.constant";
import { VendorStatus } from "@/modules/v1/vendor/vendor.constant";
import Vendor from "@/modules/v1/vendor/vendor.model";
import AppError from "@/utils/AppError";
import ERROR_CODE from "@/utils/ERROR_CODES";
import MESSAGES from "@/utils/MESSAGE";
import { status } from "http-status";
import mongoose, { type ClientSession } from "mongoose";
import type Stripe from "stripe";

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

const createPayment = async (
  payload: ICreatePaymentInput,
  session?: ClientSession,
): Promise<IPayment> => {
  const paymentDocs = await Payment.create(
    [
      {
        order: payload.order,
        buyer: payload.buyer,
        paymentMethod: payload.paymentMethod,
        provider: payload.provider,
        amount: payload.amount,
        currency: payload.currency,
        status:
          payload.status ||
          (payload.paymentMethod === PaymentMethod.COD
            ? PaymentStatus.UNPAID
            : PaymentStatus.PENDING),
        stripeSessionId: payload.stripeSessionId,
        stripePaymentIntentId: payload.stripePaymentIntentId,
      },
    ],
    session ? { session } : {},
  );

  return paymentDocs[0];
};

const createStripeCheckoutSession = async (
  order: IOrder,
  payment: IPayment,
  buyerId: string,
): Promise<IStripeCheckoutSessionResult> => {
  if (!config.STRIPE_SECRET_KEY) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      ERROR_CODE.INTERNAL_SERVER_ERROR,
      "Stripe secret key is not configured",
    );
  }

  // Prevent duplicate active checkout sessions for the same order/payment
  if (payment.stripeSessionId) {
    try {
      const existingSession = await stripe.checkout.sessions.retrieve(
        payment.stripeSessionId,
      );
      if (
        existingSession &&
        existingSession.status === "open" &&
        existingSession.url
      ) {
        return {
          sessionId: existingSession.id,
          checkoutUrl: existingSession.url,
        };
      }
    } catch {
      // If retrieval fails or session expired, proceed with new session creation
    }
  }

  const items = order.productItems || (order as any).items || [];
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
    (item) => ({
      price_data: {
        currency: config.STRIPE_CURRENCY,
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : undefined,
          metadata: {
            productId: item.product.toString(),
            size: item.size || "",
          },
        },
        unit_amount: Math.round(item.unitPrice * 100),
      },
      quantity: item.quantity,
    }),
  );

  if (order.shippingCharge > 0) {
    lineItems.push({
      price_data: {
        currency: config.STRIPE_CURRENCY,
        product_data: {
          name: "Shipping Charge",
        },
        unit_amount: Math.round(order.shippingCharge * 100),
      },
      quantity: 1,
    });
  }

  // Session expires in 30 minutes (minimum required by Stripe is 30 mins)
  const expiresAt = Math.floor(Date.now() / 1000) + 1800;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    expires_at: expiresAt,
    success_url: `${config.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id.toString()}`,
    cancel_url: `${config.STRIPE_CANCEL_URL}?order_id=${order._id.toString()}`,
    metadata: {
      orderId: order._id.toString(),
      paymentId: payment._id.toString(),
      buyerId: buyerId.toString(),
      transactionNumber: order.transactionNumber,
    },
    payment_intent_data: {
      metadata: {
        orderId: order._id.toString(),
        paymentId: payment._id.toString(),
        buyerId: buyerId.toString(),
        transactionNumber: order.transactionNumber,
      },
    },
  });

  // Store Stripe Checkout Session ID in payment record
  await Payment.findByIdAndUpdate(payment._id, {
    stripeSessionId: checkoutSession.id,
  }).exec();
  payment.stripeSessionId = checkoutSession.id;

  return {
    sessionId: checkoutSession.id,
    checkoutUrl: checkoutSession.url || "",
  };
};

const getStripeTimestamp = (
  ...timestamps: (number | undefined | null)[]
): Date => {
  for (const ts of timestamps) {
    if (typeof ts === "number" && !isNaN(ts) && ts > 0) {
      return new Date(ts * 1000);
    }
  }
  return new Date();
};

interface IConfirmPaymentSuccessOptions {
  payment: IPayment;
  paidAt: Date;
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  order?: IOrder | null;
}

const confirmPaymentSuccess = async ({
  payment,
  paidAt,
  stripePaymentIntentId,
  stripeSessionId,
  order,
}: IConfirmPaymentSuccessOptions): Promise<IPayment | null> => {
  // If order was cancelled prior to payment completion, trigger refund safely
  const targetOrder = order || (await Order.findById(payment.order).exec());

  if (targetOrder && targetOrder.status === OrderStatus.CANCELLED) {
    if (stripePaymentIntentId) {
      try {
        await stripe.refunds.create({
          payment_intent: stripePaymentIntentId,
        });
        await Payment.findByIdAndUpdate(payment._id, {
          status: PaymentStatus.REFUNDED,
          stripePaymentIntentId,
        }).exec();
        payment.status = PaymentStatus.REFUNDED;
        payment.stripePaymentIntentId = stripePaymentIntentId;
      } catch {
        // Keep record for manual review
      }
    }
    return payment;
  }

  // Atomically update payment to PAID and set paidAt if not already PAID
  // { status: { $ne: PaymentStatus.PAID } } enforces database-level idempotency
  let updatedPayment: IPayment | null = null;

  await runInTransaction(async (session) => {
    const updateQuery = Payment.findOneAndUpdate(
      {
        _id: payment._id,
        status: { $ne: PaymentStatus.PAID },
      },
      {
        $set: {
          status: PaymentStatus.PAID,
          paidAt,
          ...(payment.stripeSessionId
            ? {}
            : stripeSessionId
              ? { stripeSessionId }
              : {}),
          ...(stripePaymentIntentId ? { stripePaymentIntentId } : {}),
        },
      },
      { returnDocument: "after" },
    );
    if (session) {
      updateQuery.session(session);
    }
    updatedPayment = await updateQuery.exec();

    // If payment was already PAID, retrieve existing record
    if (!updatedPayment) {
      const existingQuery = Payment.findById(payment._id);
      if (session) {
        existingQuery.session(session);
      }
      updatedPayment = await existingQuery.exec();
    }

    // Ensure order.payment is linked
    if (
      targetOrder &&
      (!targetOrder.payment ||
        targetOrder.payment.toString() !== payment._id.toString())
    ) {
      const orderUpdate = Order.findByIdAndUpdate(targetOrder._id, {
        $set: { payment: payment._id },
      });
      if (session) {
        orderUpdate.session(session);
      }
      await orderUpdate.exec();
    }

    // Clear the buyer's cart now that payment is confirmed
    const cartUpdate = Cart.updateOne(
      { buyer: payment.buyer },
      { $set: { productItems: [] } },
    );
    if (session) {
      cartUpdate.session(session);
    }
    await cartUpdate.exec();
  });

  return updatedPayment;
};

const handleStripeWebhook = async (
  rawBody: Buffer | string,
  signature: string,
): Promise<{ received: boolean; event: string }> => {
  if (!config.STRIPE_WEBHOOK_SECRET) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      ERROR_CODE.INTERNAL_SERVER_ERROR,
      "Stripe webhook secret is not configured",
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err: any) {
    throw new AppError(
      status.BAD_REQUEST,
      ERROR_CODE.VALIDATION_ERROR,
      `${PAYMENT_MESSAGES.INVALID_SIGNATURE}: ${err.message}`,
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = session.metadata?.paymentId;
      const orderId = session.metadata?.orderId;
      const stripePaymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent as any)?.id;

      const payment = await Payment.findOne({
        $or: [
          { stripeSessionId: session.id },
          ...(paymentId ? [{ _id: paymentId }] : []),
          ...(orderId ? [{ order: orderId }] : []),
          ...(stripePaymentIntentId ? [{ stripePaymentIntentId }] : []),
        ],
      }).exec();

      if (!payment) {
        break;
      }

      // Idempotency: skip if already marked PAID to prevent duplicate events from overwriting original paidAt
      if (payment.status === PaymentStatus.PAID) {
        break;
      }

      // Verify amount and currency if present
      const expectedAmountInCents = Math.round(payment.amount * 100);
      if (
        typeof session.amount_total === "number" &&
        (session.amount_total !== expectedAmountInCents ||
          (session.currency &&
            session.currency.toLowerCase() !== payment.currency.toLowerCase()))
      ) {
        payment.status = PaymentStatus.FAILED;
        await payment.save();
        break;
      }

      // Verify payment belongs to expected order if orderId provided
      if (orderId && payment.order.toString() !== orderId) {
        break;
      }

      const paidAt = getStripeTimestamp(
        (session as any).payment_status_timestamp,
        (session.payment_intent as any)?.created,
        event.created,
        session.created,
      );

      // Reconcile and confirm payment atomically using shared confirmation logic
      await confirmPaymentSuccess({
        payment,
        paidAt,
        stripePaymentIntentId,
        stripeSessionId: session.id,
      });

      break;
    }

    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const paymentId = paymentIntent.metadata?.paymentId;
      const orderId = paymentIntent.metadata?.orderId;

      const payment = await Payment.findOne({
        $or: [
          { stripePaymentIntentId: paymentIntent.id },
          ...(paymentId ? [{ _id: paymentId }] : []),
          ...(orderId ? [{ order: orderId }] : []),
        ],
      }).exec();

      if (!payment) {
        break;
      }

      // Idempotency: skip if already marked PAID to prevent duplicate events from overwriting original paidAt
      if (payment.status === PaymentStatus.PAID) {
        break;
      }

      // Verify amount and currency if available
      const expectedAmountInCents = Math.round(payment.amount * 100);
      if (
        typeof paymentIntent.amount_received === "number" &&
        (paymentIntent.amount_received !== expectedAmountInCents ||
          (paymentIntent.currency &&
            paymentIntent.currency.toLowerCase() !==
              payment.currency.toLowerCase()))
      ) {
        payment.status = PaymentStatus.FAILED;
        await payment.save();
        break;
      }

      // Verify payment belongs to expected order if orderId provided
      if (orderId && payment.order.toString() !== orderId) {
        break;
      }

      const paidAt = getStripeTimestamp(paymentIntent.created, event.created);

      // Reconcile and confirm payment atomically using shared confirmation logic
      await confirmPaymentSuccess({
        payment,
        paidAt,
        stripePaymentIntentId: paymentIntent.id,
      });

      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const payment = await Payment.findOne({
        stripeSessionId: session.id,
      }).exec();

      if (!payment || payment.status === PaymentStatus.PAID) {
        break;
      }

      payment.status = PaymentStatus.FAILED;
      await payment.save();

      // Release reserved stock and cancel order
      const order = await Order.findById(payment.order).exec();
      if (order && order.status === OrderStatus.PENDING) {
        const items = order.productItems || (order as any).items || [];
        for (const item of items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          }).exec();
        }
        order.status = OrderStatus.CANCELLED;
        await order.save();
      }

      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const paymentId = paymentIntent.metadata?.paymentId;
      const orderId = paymentIntent.metadata?.orderId;

      const payment = await Payment.findOne({
        $or: [
          { stripePaymentIntentId: paymentIntent.id },
          ...(paymentId ? [{ _id: paymentId }] : []),
          ...(orderId ? [{ order: orderId }] : []),
        ],
      }).exec();

      if (!payment || payment.status === PaymentStatus.PAID) {
        break;
      }

      payment.status = PaymentStatus.FAILED;
      await payment.save();

      // Release reserved stock and cancel order
      const order = await Order.findById(payment.order).exec();
      if (order && order.status === OrderStatus.PENDING) {
        const items = order.productItems || (order as any).items || [];
        for (const item of items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          }).exec();
        }
        order.status = OrderStatus.CANCELLED;
        await order.save();
      }

      break;
    }

    default:
      break;
  }

  return { received: true, event: event.type };
};

const verifyStripeCheckoutSession = async (
  sessionId: string,
  buyerId: string,
): Promise<IVerifySessionResult> => {
  if (!config.STRIPE_SECRET_KEY) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      ERROR_CODE.INTERNAL_SERVER_ERROR,
      "Stripe secret key is not configured",
    );
  }

  // 1. Locate payment by stripeSessionId in MongoDB
  const payment = await Payment.findOne({ stripeSessionId: sessionId }).exec();
  if (!payment) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.PAYMENT_NOT_FOUND,
      PAYMENT_MESSAGES.PAYMENT_NOT_FOUND,
    );
  }

  // 2. Ownership security: verify payment belongs to the authenticated buyer
  if (payment.buyer.toString() !== buyerId) {
    throw new AppError(
      status.FORBIDDEN,
      ERROR_CODE.UNAUTHORIZED,
      "You are not authorized to view or verify this payment",
    );
  }

  const order = await Order.findById(payment.order).populate("payment").exec();

  // 3. If already marked PAID in DB, return immediately
  if (payment.status === PaymentStatus.PAID) {
    return {
      status: PaymentStatus.PAID,
      message: PAYMENT_MESSAGES.PAYMENT_SUCCESS,
      payment,
      order,
    };
  }

  // 4. Retrieve session directly from Stripe to check live payment status
  let stripeSession: Stripe.Checkout.Session;
  try {
    stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });
  } catch (err: any) {
    throw new AppError(
      status.BAD_REQUEST,
      ERROR_CODE.VALIDATION_ERROR,
      `Failed to retrieve Stripe session: ${err.message}`,
    );
  }

  // Security check: verify metadata matches buyer & payment
  if (
    stripeSession.metadata?.buyerId &&
    stripeSession.metadata.buyerId !== buyerId
  ) {
    throw new AppError(
      status.FORBIDDEN,
      ERROR_CODE.UNAUTHORIZED,
      "Stripe session does not belong to the authenticated buyer",
    );
  }

  const stripePaymentIntentId =
    typeof stripeSession.payment_intent === "string"
      ? stripeSession.payment_intent
      : (stripeSession.payment_intent as any)?.id;

  // 5. Check Stripe session payment status
  if (stripeSession.payment_status === "paid") {
    // Validate currency and amount
    const expectedAmountInCents = Math.round(payment.amount * 100);
    if (
      typeof stripeSession.amount_total === "number" &&
      (stripeSession.amount_total !== expectedAmountInCents ||
        (stripeSession.currency &&
          stripeSession.currency.toLowerCase() !==
            payment.currency.toLowerCase()))
    ) {
      payment.status = PaymentStatus.FAILED;
      await payment.save();
      return {
        status: PaymentStatus.FAILED,
        message: "Payment amount mismatch detected",
        payment,
        order,
      };
    }

    const paidAt = getStripeTimestamp(
      (stripeSession as any).payment_status_timestamp,
      (stripeSession.payment_intent as any)?.created,
      stripeSession.created,
    );

    // Reconcile database using shared atomic confirmation
    const updatedPayment = await confirmPaymentSuccess({
      payment,
      paidAt,
      stripePaymentIntentId,
      stripeSessionId: sessionId,
      order,
    });

    const refreshedOrder = await Order.findById(payment.order)
      .populate("payment")
      .exec();

    return {
      status: PaymentStatus.PAID,
      message: PAYMENT_MESSAGES.PAYMENT_SUCCESS,
      payment: updatedPayment || payment,
      order: refreshedOrder || order,
    };
  }

  // 6. Check if session has expired or failed
  if (stripeSession.status === "expired") {
    payment.status = PaymentStatus.FAILED;
    await payment.save();

    if (order && order.status === OrderStatus.PENDING) {
      const items = order.productItems || (order as any).items || [];
      for (const item of items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        }).exec();
      }
      order.status = OrderStatus.CANCELLED;
      await order.save();
    }

    return {
      status: PaymentStatus.FAILED,
      message: "Checkout session expired without payment",
      payment,
      order,
    };
  }

  // 7. Otherwise, payment is still pending/processing
  return {
    status: PaymentStatus.PENDING,
    message: PAYMENT_MESSAGES.PAYMENT_PENDING,
    payment,
    order,
  };
};

const getPaymentByOrderId = async (
  orderId: string,
  buyerId: string,
): Promise<IPayment | null> => {
  const payment = await Payment.findOne({
    order: orderId,
    buyer: buyerId,
  }).exec();

  if (!payment) {
    return null;
  }

  // If payment is pending and has a Stripe session, reconcile with Stripe if possible
  if (
    payment.status === PaymentStatus.PENDING &&
    payment.provider === PaymentProvider.STRIPE &&
    payment.stripeSessionId
  ) {
    try {
      const stripeSession = await stripe.checkout.sessions.retrieve(
        payment.stripeSessionId,
        { expand: ["payment_intent"] },
      );

      if (stripeSession && stripeSession.payment_status === "paid") {
        const stripePaymentIntentId =
          typeof stripeSession.payment_intent === "string"
            ? stripeSession.payment_intent
            : (stripeSession.payment_intent as any)?.id;

        const paidAt = getStripeTimestamp(
          (stripeSession as any).payment_status_timestamp,
          (stripeSession.payment_intent as any)?.created,
          stripeSession.created,
        );

        const updatedPayment = await confirmPaymentSuccess({
          payment,
          paidAt,
          stripePaymentIntentId,
          stripeSessionId: payment.stripeSessionId,
        });

        return updatedPayment || payment;
      }
    } catch {
      // If Stripe retrieval fails, proceed with existing record
    }
  }

  return payment;
};

const confirmCODPayment = async (
  orderId: string,
  user: { userId: string; role: string },
): Promise<{
  payment: IPayment;
  order: IOrder;
}> => {
  const order = await Order.findById(orderId).exec();

  if (!order) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.ORDER_NOT_FOUND,
      ORDER_MESSAGES.ORDER_NOT_FOUND,
    );
  }

  // 1. Authorization: Vendor must own the order, Admin can confirm any order
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

  // 2. Validate Order Type: must be COD
  if (order.orderType !== OrderType.COD) {
    throw new AppError(
      status.BAD_REQUEST,
      ERROR_CODE.BAD_REQUEST,
      PAYMENT_MESSAGES.COD_ONLY,
    );
  }

  // 3. Validate Delivery Status: must be DELIVERED
  if (order.status !== OrderStatus.DELIVERED) {
    throw new AppError(
      status.BAD_REQUEST,
      ERROR_CODE.BAD_REQUEST,
      PAYMENT_MESSAGES.ORDER_NOT_DELIVERED,
    );
  }

  // 4. Retrieve Payment record
  const payment = await Payment.findOne({ order: order._id }).exec();
  if (!payment) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.PAYMENT_NOT_FOUND,
      PAYMENT_MESSAGES.PAYMENT_NOT_FOUND,
    );
  }

  // 5. Validate current Payment status
  if (payment.status === PaymentStatus.PAID) {
    throw new AppError(
      status.BAD_REQUEST,
      ERROR_CODE.PAYMENT_ALREADY_COMPLETED,
      PAYMENT_MESSAGES.PAYMENT_ALREADY_COMPLETED,
    );
  }

  if (
    payment.status === PaymentStatus.FAILED ||
    payment.status === PaymentStatus.REFUNDED
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      ERROR_CODE.BAD_REQUEST,
      "Cannot confirm payment for a failed or refunded order",
    );
  }

  // 6. Atomically update Payment to PAID with paidAt = new Date() inside transaction
  const paidAt = new Date();
  let updatedPayment: IPayment | null = null;

  await runInTransaction(async (session) => {
    const updatePaymentQuery = Payment.findOneAndUpdate(
      {
        _id: payment._id,
        status: { $ne: PaymentStatus.PAID },
      },
      {
        $set: {
          status: PaymentStatus.PAID,
          paidAt,
        },
      },
      { returnDocument: "after" },
    );
    if (session) {
      updatePaymentQuery.session(session);
    }
    updatedPayment = await updatePaymentQuery.exec();

    if (!updatedPayment) {
      throw new AppError(
        status.BAD_REQUEST,
        ERROR_CODE.PAYMENT_ALREADY_COMPLETED,
        PAYMENT_MESSAGES.PAYMENT_ALREADY_COMPLETED,
      );
    }

    // Ensure order.payment reference is linked
    if (!order.payment || order.payment.toString() !== payment._id.toString()) {
      const orderUpdate = Order.findByIdAndUpdate(order._id, {
        $set: { payment: payment._id },
      });
      if (session) {
        orderUpdate.session(session);
      }
      await orderUpdate.exec();
    }
  });

  const refreshedOrder = await Order.findById(order._id)
    .populate("payment")
    .exec();

  return {
    payment: updatedPayment || payment,
    order: refreshedOrder || order,
  };
};

const paymentService = {
  createPayment,
  createStripeCheckoutSession,
  confirmPaymentSuccess,
  handleStripeWebhook,
  verifyStripeCheckoutSession,
  confirmCODPayment,
  getPaymentByOrderId,
};

export default paymentService;
