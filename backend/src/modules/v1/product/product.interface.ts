import type { TProductSize } from "@/modules/v1/product/product.constant";
import type { Types } from "mongoose";

export interface IProductImage {
  publicId: string;
  url: string;
  width: number | null;
  height: number | null;
}

export interface IProduct {
  _id: Types.ObjectId;
  vendor: Types.ObjectId;
  category: Types.ObjectId;
  name: string;
  description: string;
  brand?: string;
  price: number;
  stock: number;
  sizes: TProductSize[];
  featureImage: IProductImage;
  images: IProductImage[];
  salesCount: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateProductInput {
  category: string;
  name: string;
  description: string;
  brand?: string;
  price: number;
  stock: number;
  sizes?: TProductSize[];
}

export interface IUpdateProductInput {
  category?: string;
  name?: string;
  description?: string;
  brand?: string;
  price?: number;
  stock?: number;
  sizes?: TProductSize[];
  isActive?: boolean;
}

export interface IProductQueryOptions {
  page?: number;
  limit?: number;
  skip?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
}

export interface IPaginatedProductsResult<T = IProduct> {
  data: T[];
  pagination: {
    page: number;
    skip: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
  };
}
