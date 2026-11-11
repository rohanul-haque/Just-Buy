import type { Types } from "mongoose";
import type { TGender } from "@/modules/v1/buyer/buyer.constant";

export interface IProfileImage {
  publicId: string;
  url: string;
  width: number | null;
  height: number | null;
}

export interface IBuyer {
  _id?: Types.ObjectId;
  buyer: Types.ObjectId;
  phoneNumber?: string;
  gender?: TGender;
  address?: string;
  profile: IProfileImage;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUpdateBuyerProfileInput {
  phoneNumber?: string;
  gender?: TGender;
  address?: string;
}

export interface IBuyerQueryOptions {
  page?: number;
  limit?: number;
  skip?: number;
  search?: string;
  gender?: TGender;
}

