/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-party module
 */
import type { Types } from "mongoose";

/**
 * Type
 */
import type { IAvatar } from "@/modules/v1/seller/seller.interface";

/**
 * Create Category Request
 */
export interface ICreateCategoryPaylod {
  userId: Types.ObjectId;
  payload: {
    name: string;
  };
  file?: Express.Multer.File;
}

/**
 * Category Interface
 */
export interface ICategory {
  createdBy: Types.ObjectId;
  name: string;
  image: IAvatar;
  createdAt: string;
  updatedAt: string;
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
export interface IUpdateCategoryPaylod {
  id: string;
  payload: IUpdateCategoryPayload;
  file?: Express.Multer.File;
}

/**
 * Get Categories Query Parameters
 */
export interface IGetCategoriesParams {
  limit: number;
  offset: number;
}

/**
 * Paginated Categories Result
 */
export interface IGetCategoriesResult {
  total: number;
  limit: number;
  skip: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  categories: ICategory[];
}
