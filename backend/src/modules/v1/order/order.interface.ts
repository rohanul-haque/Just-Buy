import type {
  OrderStatus,
  OrderType,
} from "@/modules/v1/order/order.constant";
import type { TProductSize } from "@/modules/v1/product/product.constant";
import type { Types } from "mongoose";

export interface IShippingAddress {
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
  country?: string;
}

export interface IOrderItem {
  _id?: Types.ObjectId;
  product: Types.ObjectId;
  vendor: Types.ObjectId;
  name: string;
  image: string;
  brand: string;
  unitPrice: number;
  quantity: number;
  size?: TProductSize;
  itemSubtotal: number;
  commissionRate: number;
  adminCommission: number;
  vendorEarning: number;
}

export interface IOrder {
  _id: Types.ObjectId;
  buyer: Types.ObjectId;
  vendor: Types.ObjectId;
  transactionNumber: string;
  orderType: OrderType;
  shippingAddress: IShippingAddress;
  productItems: IOrderItem[];
  items?: IOrderItem[];
  subtotal: number;
  shippingCharge: number;
  totalAmount: number;
  status: OrderStatus;
  payment?: Types.ObjectId | any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateOrderResult {
  order: IOrder;
  payment: any;
  checkoutUrl?: string;
  sessionId?: string;
}

export interface ICreateOrderInput {
  orderType?: OrderType;
  shippingAddress: IShippingAddress;
}

export interface IUpdateOrderStatusInput {
  status: OrderStatus;
  note?: string;
}

export interface IOrderQueryOptions {
  page?: number;
  limit?: number;
  skip?: number;
  status?: OrderStatus;
  orderType?: OrderType;
}

export interface IPaginatedOrdersResult {
  data: IOrder[];
  pagination: {
    page: number;
    limit: number;
    skip: number;
    total: number;
    totalPages: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
  };
}
