/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Modules
 */
import { Types } from "mongoose";

/**
 * Application Modules
 */
import type { IAvatar } from "@/modules/v1/seller/seller.interface";

/**
 * Order Status Enum Definition
 */
export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

/**
 * Payment Status Enum Definition
 */
export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

/**
 * Payment Method Enum Definition
 */
export enum PaymentMethod {
  COD = "COD",
  ONLINE = "ONLINE",
}

/**
 * Payment Method Enum Definition
 */
export interface IShippingAddress {
  fullName: string;
  location: string;
  phoneNumber: string;
  emailAddress: string;
}

/**
 * Payment Method Enum Definition
 */
export interface IOrderItem {
  product: Types.ObjectId;
  seller: Types.ObjectId;
  name: string;
  images: IAvatar[];
  price: number;
  quantity: number;
}

/**
 * Payment Method Enum Definition
 */
export interface IOrder {
  buyer: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
}

/**
 * Create Order Input Interface
 */
export interface ICreateOrderInput {
  shippingAddress: IShippingAddress;
  paymentMethod: PaymentMethod;
}

/**
 * Create Order Input Type
 */
export interface CreateOrderInput extends ICreateOrderInput {}

/**
 * Create Order Request Interface
 */
export interface ICreateOrderRequest extends ICreateOrderInput {}

/**
 * Vendor Order Buyer Interface
 */
export interface IVendorOrderBuyer {
  _id: Types.ObjectId | string;
  name: string;
  avatar: IAvatar | null;
}

/**
 * Vendor Order Item Interface
 */
export interface IVendorOrderItem {
  productId: Types.ObjectId | string;
  name: string;
  price: number;
  quantity: number;
}

/**
 * Vendor Order Response Interface
 */
export interface IVendorOrderResponse {
  _id: Types.ObjectId | string;
  buyer: IVendorOrderBuyer;
  items: IVendorOrderItem[];
  orderStatus: OrderStatus;
  total: number;
  createdAt: Date | string;
}

export type IVendorOrder = IVendorOrderResponse;

