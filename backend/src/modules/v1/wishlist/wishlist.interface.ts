import type { Types } from "mongoose";

export interface IWishlist {
  _id: Types.ObjectId;
  buyer: Types.ObjectId;
  products: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddWishlistItemInput {
  productId: string;
}

