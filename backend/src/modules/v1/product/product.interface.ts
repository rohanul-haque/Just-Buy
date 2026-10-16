/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

import { Types } from "mongoose";
import { IAvatar } from "../seller/seller.interface";

/**
 * Product Interface
 */

export enum Size {
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
  XXL = "XXL",
}

export interface IProduct {
  _id: Types.ObjectId;
  seller: {
    _id: Types.ObjectId;
    fullName: string;
    email: string;
    role: "seller";
  };
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  stockQuantity: number;
  sizes?: Size[];
  images: IAvatar[];
}

/**
 * Create Product Payload
 */
export type CreateProduct = Pick<
  IProduct,
  | "name"
  | "description"
  | "category"
  | "brand"
  | "price"
  | "stockQuantity"
  | "sizes"
  | "images"
>;

/**
 * Create Product Request
 */
export interface ICreateProductRequest {
  sellerId: Types.ObjectId;
  payload: CreateProduct;
  files?: Express.Multer.File[];
}

export interface IGetProductsQuery {
  category?: string;
  name?: string;
  price?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface IGetProductsResult {
  products: IProduct[];
  total: number;
  limit: number;
  skip: number;
}

/**
 * Product ID
 */
export interface IProductId {
  productId: Types.ObjectId;
}

export type UpdateProductPayload = Partial<
  Pick<
    IProduct,
    | "name"
    | "description"
    | "category"
    | "brand"
    | "price"
    | "stockQuantity"
    | "sizes"
  >
>;

export interface IUpdateProductRequest {
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  payload: UpdateProductPayload;
  files?: Express.Multer.File[];
}
