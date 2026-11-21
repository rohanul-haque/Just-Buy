import type {
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
} from "@/modules/v1/payment/payment.constant";
import type { Types } from "mongoose";

export interface IPayment {
  _id: Types.ObjectId;
  order: Types.ObjectId;
  buyer: Types.ObjectId;
  paymentMethod: PaymentMethod;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  paidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreatePaymentInput {
  order: Types.ObjectId | string;
  buyer: Types.ObjectId | string;
  paymentMethod: PaymentMethod;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  status?: PaymentStatus;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
}

export interface IStripeCheckoutSessionResult {
  sessionId: string;
  checkoutUrl: string;
}

export interface IVerifySessionResult {
  status: PaymentStatus;
  message: string;
  payment: IPayment | null;
  order?: any;
}

