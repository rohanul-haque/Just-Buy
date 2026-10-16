/**
 * Third-party Modules
 */
import type { Types } from "mongoose";

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
 * Add to Cart Request
 */
export interface IAddToCartRequest {
  buyerId: Types.ObjectId;
  productId: Types.ObjectId;
  quantity: number;
}

/**
 * Update Cart Quantity Request
 */
export interface IUpdateCartQuantityRequest {
  buyerId: Types.ObjectId;
  productId: Types.ObjectId;
  quantity: number;
}
