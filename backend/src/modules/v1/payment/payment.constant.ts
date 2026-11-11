export enum PaymentStatus {
  UNPAID = "UNPAID",
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum PaymentMethod {
  COD = "COD",
  ONLINE = "ONLINE",
}

export enum PaymentProvider {
  COD = "COD",
  STRIPE = "STRIPE",
}

export const PAYMENT_MESSAGES = {
  PAYMENT_SUCCESS: "Payment completed successfully",
  PAYMENT_PENDING: "Payment is pending",
  PAYMENT_FAILED: "Payment failed",
  PAYMENT_NOT_FOUND: "Payment record not found",
  PAYMENT_ALREADY_COMPLETED: "Payment has already been completed",
  WEBHOOK_PROCESSED: "Webhook event processed successfully",
  INVALID_SIGNATURE: "Invalid webhook signature",
  CHECKOUT_SESSION_CREATED: "Stripe checkout session created successfully",
  COD_PAYMENT_CONFIRMED: "Cash on delivery payment confirmed successfully",
  COD_ONLY: "Only Cash on Delivery (COD) orders can be confirmed via this action",
  ORDER_NOT_DELIVERED:
    "COD payment can only be confirmed after the order has been delivered",
  UNAUTHORIZED_CONFIRMATION:
    "You do not have permission to confirm payment for this order",
} as const;

