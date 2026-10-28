/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
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
 * Size Enum
 */
export enum Size {
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
  XXL = "XXL",
}

/**
 * Product Model Interface
 */
export interface IProduct {
  _id: Types.ObjectId;
  seller: Types.ObjectId;
  name: string;
  description: string;
  category: Types.ObjectId;
  brand: string;
  price: number;
  stockQuantity: number;
  sellCount: number;
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
 * Create Product Request Interface
 */
export interface ICreateProductPayload {
  sellerId: Types.ObjectId;
  payload: CreateProduct;
  files?: Express.Multer.File[];
}

/**
 * Get All Products Query Interface
 */
export interface IGetProductsQuery {
  category?: string;
  name?: string;
  search?: string;
  limit: number;
  offset: number;
}

/**
 * Get All Products Result Interface
 */
export interface IGetProductsResult {
  seller: {
    _id: Types.ObjectId;
    fullName: string;
    email: string;
    role: "seller";
  };
  name: string;
  description: string;
  category: { _id: Types.ObjectId; name: string };
  brand: string;
  price: number;
  stockQuantity: number;
  sellCount: number;
  sizes?: Size[];
  images: IAvatar[];
}

/**
 * Get All Products Response Interface
 */
export interface IGetProductsResponse {
  products: IGetProductsResult[];
  total: number;
  limit: number;
  skip: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Update Product Payload Interface
 */
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

/**
 * Update Product Request Interface
 */
export interface IUpdateProductPayload {
  id: string;
  sellerId: Types.ObjectId;
  payload: UpdateProductPayload;
  files?: Express.Multer.File[];
}

/**
 * Delete Product Payload Interface
 */
export interface IDeleteProductPayload {
  id: string;
  sellerId: Types.ObjectId;
}
