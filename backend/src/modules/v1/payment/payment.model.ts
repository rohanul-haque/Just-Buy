import {
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
} from "@/modules/v1/payment/payment.constant";
import type { IPayment } from "@/modules/v1/payment/payment.interface";
import { Schema, model } from "mongoose";

const paymentSchema = new Schema<IPayment>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
      index: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    provider: {
      type: String,
      enum: Object.values(PaymentProvider),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      default: "usd",
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      required: true,
      index: true,
    },
    stripeSessionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    stripePaymentIntentId: {
      type: String,
      sparse: true,
      index: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

paymentSchema.index({ buyer: 1, createdAt: -1 });

export const Payment = model<IPayment>("Payment", paymentSchema);
export default Payment;

