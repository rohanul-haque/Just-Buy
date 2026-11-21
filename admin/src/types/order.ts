export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface IOrderItem {
  _id?: string;
  product: string | { _id: string; name: string };
  vendor: string | { _id: string; shopName?: string };
  name: string;
  image: string;
  brand: string;
  unitPrice: number;
  quantity: number;
  size?: string;
  itemSubtotal: number;
  commissionRate: number;
  adminCommission: number;
  vendorEarning: number;
}

export interface IOrder {
  _id: string;
  buyer: {
    _id: string;
    name?: string;
    email?: string;
  } | string;
  vendor: {
    _id: string;
    shopName?: string;
  } | string;
  transactionNumber: string;
  orderType?: string;
  shippingAddress?: {
    fullName: string;
    phoneNumber: string;
    address: string;
    city: string;
    postalCode: string;
    country?: string;
  };
  productItems?: IOrderItem[];
  items?: IOrderItem[];
  subtotal: number;
  shippingCharge: number;
  totalAmount: number;
  status: OrderStatus;
  payment?: any;
  createdAt: string;
  updatedAt: string;
}
