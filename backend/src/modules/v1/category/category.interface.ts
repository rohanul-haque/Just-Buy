import type { Document, Types } from "mongoose";

export interface ICategoryImage {
  publicId: string;
  url: string;
  width: number | null;
  height: number | null;
}

export interface ICategory {
  _id?: Types.ObjectId;
  admin: Types.ObjectId;
  name: string;
  image: ICategoryImage;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ICategoryDocument = ICategory & Document;

export interface ICreateCategoryInput {
  name: string;
}

export interface IUpdateCategoryInput {
  name?: string;
  isActive?: boolean;
}

export interface IUpdateCategoryStatusInput {
  isActive: boolean;
}

export interface ICategoryQueryOptions {
  search?: string;
  isActive?: boolean | string;
}
