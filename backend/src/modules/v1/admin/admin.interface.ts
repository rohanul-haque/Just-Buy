import type { Types } from "mongoose";

export interface IAdminProfileImage {
  type: string;
  url: string;
  publicId: string;
}

export interface IAdmin {
  _id?: Types.ObjectId;
  admin: Types.ObjectId;
  phoneNumber?: string;
  profile: IAdminProfileImage;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUpdateAdminProfileInput {
  phoneNumber?: string;
}
