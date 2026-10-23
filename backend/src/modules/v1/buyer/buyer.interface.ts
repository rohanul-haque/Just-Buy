/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Modules
 */
import { Types } from "mongoose";

/**
 * Types
 */
import type { IUser } from "@/modules/v1/auth/auth.interface";
import type { IAvatar } from "@/modules/v1/seller/seller.interface";

/**
 * Gender Enum
 */
export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

/**
 * Buyer Interface
 */
export interface IBuyer {
  user: Types.ObjectId;
  avatar: IAvatar;
  phoneNumber: string;
  gender: Gender;
}

/**
 * Buyer Request Payload
 */
export type BuyerRequest = Partial<Pick<IBuyer, "phoneNumber" | "gender">> & {
  fullName?: string;
  password?: string;
};

/**
 * Buyer Profile
 */
export interface IBuyerProfile {
  _id: Types.ObjectId;
  user: IUser & {
    _id: Types.ObjectId;
  };
  avatar: IAvatar;
  phoneNumber: string;
  gender: Gender;
  createdAt: string;
  updatedAt: string;
}

export interface IGetAllBuyerProfileParams {
  limit: number;
  offset: number;
}

/**
 * All Buyer Profile Response
 */
export interface IAllBuyerProfile {
  total: number;
  limit: number;
  skip: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  allBuyers: IBuyerProfile[];
}

/**
 * Update Buyer Payload
 */
export interface IUpdateBuyerPayload {
  userId: Types.ObjectId;
  payload: BuyerRequest;
  file?: Express.Multer.File;
}
