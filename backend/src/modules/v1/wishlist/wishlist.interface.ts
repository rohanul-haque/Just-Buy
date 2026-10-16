/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Thired-party Module
 */
import { Types } from "mongoose";

/**
 * Type
 */
import type { IAvatar } from "@/modules/v1/seller/seller.interface";

/**
 * Wishlist Interface Definition
 */
export interface IWishlist {
  buyer: Types.ObjectId;
  products: Types.ObjectId[];
}

/**
 * Interface for adding a product to the wishlist
 */
export interface IAddWishlistRequest {
  buyerId: Types.ObjectId;
  productId: Types.ObjectId;
}

/**
 * Type alias for buyer ID
 */
export type BuyerId = IWishlist["buyer"];

/**
 * Interface for populated product inside wishlist
 */
export interface IWishlistProduct {
  _id: Types.ObjectId;
  name: string;
  price: number;
  images: IAvatar[];
}

/**
 * Interface for wishlist response with populated products
 */
export interface IWishlistResponse {
  _id: Types.ObjectId;
  buyer: Types.ObjectId;
  products: IWishlistProduct[];
  createdAt: Date | string;
  updatedAt: Date | string;
}
