import type { TProductSize } from "@/modules/v1/product/product.constant";
import type { Types } from "mongoose";

export interface ICartItem {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  quantity: number;
  size?: TProductSize;
}

export interface ICart {
  _id: Types.ObjectId;
  buyer: Types.ObjectId;
  productItems: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddToCartInput {
  productId: string;
  quantity: number;
  size?: TProductSize;
}

export interface IUpdateCartItemInput {
  quantity: number;
}

