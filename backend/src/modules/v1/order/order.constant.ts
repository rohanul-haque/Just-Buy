export enum OrderType {
  COD = "COD",
  ONLINE = "ONLINE",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export const VALID_ORDER_STATUS_TRANSITIONS: Record<
  OrderStatus,
  OrderStatus[]
> = {
  [OrderStatus.PENDING]: [
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

export const DEFAULT_COMMISSION_RATE = 15;
export const DEFAULT_SHIPPING_CHARGE = 50;

export const ORDER_MESSAGES = {
  ORDER_CREATED: "Order placed successfully",
  ORDER_CANCELLED: "Order cancelled successfully",
  ORDER_FETCHED: "Order retrieved successfully",
  ORDERS_FETCHED: "Orders retrieved successfully",
  ORDER_NOT_FOUND: "Order not found",
  ORDER_STATUS_UPDATED: "Order status updated successfully",
  ORDER_UNAUTHORIZED: "You do not have permission to update this order",
  ORDER_ALREADY_TERMINAL:
    "Cannot update status of an already delivered or cancelled order",
  ORDER_ALREADY_CANCELLED: "Order is already cancelled",
  ORDER_CANNOT_BE_CANCELLED: "This order cannot be cancelled",
  CART_EMPTY: "Cart is empty. Add products to cart before placing an order.",
  INSUFFICIENT_STOCK: "Requested quantity exceeds available stock",
  ONLINE_PAYMENT_UNAVAILABLE:
    "Online payment is not supported yet. Please use Cash on Delivery (COD).",
} as const;
