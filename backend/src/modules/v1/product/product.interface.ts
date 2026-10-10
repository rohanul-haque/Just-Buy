/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

import { Types } from "mongoose";

/**
 * Product Image Interface
 */
export interface IProductImage {
  publicId: string;
  url: string;
  width: number | null;
  height: number | null;
}

/**
 * Product Interface
 */
export interface IProduct {
  _id?: Types.ObjectId;
  seller: Types.ObjectId;
  category: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  images: IProductImage[];
  isFeatured: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;

  // Relational ERD Aliases
  product_id?: Types.ObjectId;
  seller_id?: Types.ObjectId;
  category_id?: Types.ObjectId;
  stock_quantity?: number;
  is_featured?: boolean;
  created_at?: string | Date;
  updated_at?: string | Date;
}

/**
 * Populated Product Interface
 */
export interface IPopulatedProduct extends Omit<
  IProduct,
  "seller" | "category"
> {
  seller: {
    _id: Types.ObjectId;
    fullName?: string;
    email?: string;
  };
  category: {
    _id: Types.ObjectId;
    name: string;
    slug?: string;
  };
}

/**
 * Create Product Payload
 */
export interface ICreateProductPayload {
  seller?: Types.ObjectId | string;
  sellerId?: string;
  category: Types.ObjectId | string;
  categoryId?: string;
  name: string;
  description?: string;
  price: number;
  stockQuantity?: number;
  stock_quantity?: number;
  images?: IProductImage[];
  isFeatured?: boolean;
}

/**
 * Create Product Request
 */
export interface ICreateProductRequest {
  userId: Types.ObjectId;
  payload: ICreateProductPayload;
  files?: Express.Multer.File[];
}

/**
 * Update Product Payload
 */
export interface IUpdateProductPayload {
  seller?: Types.ObjectId | string;
  sellerId?: string;
  seller_id?: string;
  category?: Types.ObjectId | string;
  categoryId?: string;
  category_id?: string;
  name?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  stock_quantity?: number;
  images?: IProductImage[];
  isFeatured?: boolean;
  is_featured?: boolean;
}

/**
 * Update Product Request
 */
export interface IUpdateProductRequest {
  productId: string;
  userId?: Types.ObjectId;
  payload: IUpdateProductPayload;
  files?: Express.Multer.File[];
}

/**
 * Get Products Query Parameters
 */
export interface IGetProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  seller?: string;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "name" | "price" | "stockQuantity" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

/**
 * Paginated Products Result
 */
export interface IGetProductsResult {
  products: IProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  skip: number;
}
