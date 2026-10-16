/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Types
 */
import type { IUser } from "@/modules/v1/auth/auth.intarface";
import type { IAvatar } from "@/modules/v1/seller/seller.interface";
import type { Types } from "mongoose";

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
 * Update Buyer Request
 */
export interface IUpdateBuyerRequest {
  userId: Types.ObjectId;
  payload: BuyerRequest;
  file?: Express.Multer.File;
}

/**
 * Buyer Profile
 */
export interface IBuyerProfile {
  _id: Types.ObjectId;
  user: IUser;
  avatar: IAvatar;
  phoneNumber: string;
  gender: Gender;
  createdAt: string;
  updatedAt: string;
}

/**
 * All Buyer Profile Response
 */
export interface IAllBuyerProfile {
  total: number;
  limit: number;
  skip: number;
  allBuyers: IBuyerProfile[];
}
