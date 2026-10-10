/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

import { Types } from "mongoose";
import { IAvatar } from "../seller/seller.interface";

/**
 * Category Interface
 */
export interface ICategory {
  createdBy: Types.ObjectId;
  name: string;
  image: IAvatar;
}

/**
 * Create Category Payload
 */
export interface ICreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

/**
 * Create Category Request
 */
export interface ICreateCategoryRequest {
  userId: Types.ObjectId;
  payload: ICreateCategoryPayload;
  file?: Express.Multer.File;
}

/**
 * Update Category Payload
 */
export interface IUpdateCategoryPayload {
  name?: string;
}

/**
 * Update Category Request
 */
export interface IUpdateCategoryRequest {
  categoryId: Types.ObjectId;
  payload: IUpdateCategoryPayload;
  file?: Express.Multer.File;
}

/**
 * Get Categories Query Parameters
 */
export interface IGetCategoriesQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

/**
 * Paginated Categories Result
 */
export interface IGetCategoriesResult {
  categories: ICategory[];
  total: number;
}

/**
 * Category ID
 */
export interface ICategoryId {
  categoryId: Types.ObjectId;
}
