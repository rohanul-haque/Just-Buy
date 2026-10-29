/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-party Modules
 */
import type { Types } from "mongoose";

/**
 * Type
 */
import type { IAvatar } from "@/modules/v1/seller/seller.interface";

/**
 * Cart Item Interface
 */
export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
}

/**
 * Cart Interface
 */
export interface ICart {
  buyer: Types.ObjectId;
  items: ICartItem[];
}

/**
 * Add to Cart Payload
 */
export interface IAddToCartPayload {
  buyerId: Types.ObjectId;
  id: string;
  quantity: number;
}

export interface IRemoveFromCartRequest {
  buyerId: Types.ObjectId;
  productId: Types.ObjectId;
}

/**
 * Update Cart Quantity Request
 */
export interface IUpdateCartQuantityPayload {
  buyerId: Types.ObjectId;
  id: string;
  quantity: number;
}

export type BuyerId = IUpdateCartQuantityPayload["buyerId"];

/**
 * Populated Product inside Cart
 */
export interface ICartProduct {
  _id: Types.ObjectId;
  name: string;
  price: number;
  images: IAvatar[];
}

/**
 * Populated Cart Item
 */
export interface IPopulatedCartItem {
  _id: Types.ObjectId;
  product: ICartProduct;
  quantity: number;
}

/**
 * Cart Response with Populated Products
 */
export interface ICartResponse {
  _id?: Types.ObjectId;
  buyer: Types.ObjectId;
  items: IPopulatedCartItem[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
