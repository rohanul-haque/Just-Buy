/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Module
 */
import { Types } from "mongoose";

/**
 * Type
 */
import { Gender } from "@/modules/v1/buyer/buyer.interface";

/**
 * Seller Verification Status
 */
export enum SellerVerificationStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  REJECTED = "rejected",
}

/**
 * Avatar Interface
 */
export interface IAvatar {
  publicId: string;
  url: string;
  width: number | null;
  height: number | null;
}

/**
 * User Interface
 */
export interface IUser {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  role: "seller";
  isActive: boolean;
}

/**
 * Seller Profile
 */
export interface ISeller {
  user: Types.ObjectId;
  storeName: string;
  phoneNumber: string;
  shopAddress: string;
  avatar: IAvatar;
  gender: Gender;
  verificationStatus: SellerVerificationStatus;
}

/**
 * Seller Request
 */
export type SellerRequest = Partial<
  Pick<ISeller, "storeName" | "phoneNumber" | "shopAddress" | "gender">
> & {
  fullName?: string;
  password?: string;
};

/**
 * Seller Update Request
 */
export interface IUpdateSellerRequest {
  userId: Types.ObjectId;
  payload: SellerRequest;
  file?: Express.Multer.File;
}

/**
 * Seller ID
 */
export interface ISellerId {
  userId: Types.ObjectId;
}

/**
 * Seller Profile Response
 */
export interface ISellerProfile {
  _id: Types.ObjectId;
  user: IUser;
  storeName: string;
  shopAddress: string;
  phoneNumber: string;
  gender: Gender;
  verificationStatus: SellerVerificationStatus;
  avatar: IAvatar;
  createdAt: string;
  updatedAt: string;
}

/**
 * All Seller Profile Response
 */
export interface IAllSellerProfile {
  total: number;
  limit: number;
  skip: number;
  allSellers: ISellerProfile[];
}
