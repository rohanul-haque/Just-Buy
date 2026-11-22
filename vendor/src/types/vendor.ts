import type { IUser } from "./user";

export type VendorStatus =
  | "NOT_SUBMITTED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";

export interface IVendorImage {
  publicId?: string;
  url: string;
  width?: number | null;
  height?: number | null;
}

export interface IVendor {
  _id: string;
  vendor: IUser;
  shopName?: string;
  location?: string;
  licenceNumber?: string;
  profile?: IVendorImage;
  nidFrontImage?: IVendorImage;
  nidBackImage?: IVendorImage;
  status: VendorStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUpdateVendorProfileInput {
  shopName?: string;
  location?: string;
  licenceNumber?: string;
}
