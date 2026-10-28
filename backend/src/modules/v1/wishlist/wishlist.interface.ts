/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-party Module
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
 * Type alias for buyer ID
 */
export type BuyerId = IWishlist["buyer"];

/**
 * Interface for adding a product to the wishlist
 */
export interface IAddWishlistPayload {
  buyerId: Types.ObjectId;
  id: string;
}

export interface GetAllWishlistParams {
  limit: number;
  offset: number;
  buyerId: Types.ObjectId;
}

/**
 * Interface for populated product inside wishlist
 */
export interface IWishlistProduct {
  _id: Types.ObjectId;
  name: string;
  price: number;
  images: IAvatar[];
  createdAt?: Date | string;
}

/**
 * Interface for paginated wishlist response
 */
export interface IWishlistResponse {
  products: IWishlistProduct[];
  total: number;
  limit: number;
  offset: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface IRemoveWishlistPayload {
  buyerId: Types.ObjectId;
  id: string;
}
