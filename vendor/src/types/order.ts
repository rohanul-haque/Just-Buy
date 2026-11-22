export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type OrderType = "COD" | "ONLINE";

export type PaymentStatus =
  | "UNPAID"
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export interface IOrderItem {
  _id?: string;
  product: string | { _id: string; name: string };
  vendor: string | { _id: string };
  name: string;
  image: string;
  brand: string;
  unitPrice: number;
  quantity: number;
  size?: string;
  itemSubtotal: number;
  commissionRate?: number;
  adminCommission?: number;
  vendorEarning?: number;
}

export interface IPayment {
  _id?: string;
  paymentMethod: "COD" | "STRIPE";
  provider?: string;
  amount: number;
  currency?: string;
  status: PaymentStatus;
  paidAt?: string | null;
}

export interface IShippingAddress {
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
  country?: string;
}

export interface IOrder {
  _id: string;
  transactionNumber: string;
  buyer: {
    _id: string;
    name?: string;
    email?: string;
  };
  vendor: string | { _id: string };
  orderType: OrderType;
  shippingAddress: IShippingAddress;
  productItems: IOrderItem[];
  subtotal: number;
  shippingCharge: number;
  totalAmount: number;
  status: OrderStatus;
  payment?: IPayment;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const VALID_ORDER_STATUS_TRANSITIONS: Record<
  OrderStatus,
  OrderStatus[]
> = {
  PENDING: ["CONFIRMED", "PROCESSING", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["PROCESSING", "CANCELLED"],
  CANCELLED: ["PROCESSING"],
};
