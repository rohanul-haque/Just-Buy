export type GenderType = "MALE" | "FEMALE" | "OTHER";

export interface BuyerProfileUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface BuyerProfile {
  _id: string;
  buyer: BuyerProfileUser;
  phoneNumber?: string;
  gender?: GenderType;
  address?: string;
  profile?: {
    publicId?: string;
    url?: string;
    width?: number;
    height?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateBuyerProfileInput {
  phoneNumber?: string;
  gender?: GenderType;
  address?: string;
  profileImage?: File | null;
}

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderShippingAddress {
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
  country?: string;
}

export interface OrderItem {
  _id?: string;
  product: string;
  vendor: string | { _id: string; shopName?: string };
  name: string;
  image: string;
  brand: string;
  unitPrice: number;
  quantity: number;
  size?: string;
  itemSubtotal: number;
}

export interface Order {
  _id: string;
  buyer: string;
  vendor?: string | { _id: string; shopName?: string };
  transactionNumber: string;
  orderType: string;
  shippingAddress: OrderShippingAddress;
  productItems: OrderItem[];
  subtotal: number;
  shippingCharge: number;
  totalAmount: number;
  status: OrderStatus;
  payment?: {
    paymentMethod?: string;
    status?: string;
    amount?: number;
    paidAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrdersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type OrderType = "COD" | "ONLINE";
export type PaymentStatus = "UNPAID" | "PENDING" | "PAID" | "FAILED";

export interface CreateOrderInput {
  orderType: OrderType;
  shippingAddress: OrderShippingAddress;
}

export interface CreateOrderResponse {
  order: Order;
  payment: {
    _id: string;
    order: string;
    buyer: string;
    paymentMethod: string;
    provider: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    paidAt?: string | null;
    stripeSessionId?: string;
  };
  checkoutUrl?: string;
  sessionId?: string;
}

export interface VerifySessionResponse {
  status: PaymentStatus;
  message: string;
  payment: {
    _id: string;
    status: PaymentStatus;
    amount: number;
    currency: string;
    paidAt?: string | null;
  };
  order: Order;
}


