import type { Types } from "mongoose";
import type { TVendorStatus } from "@/modules/v1/vendor/vendor.constant";

export interface IVendorImage {
  publicId: string;
  url: string;
  width: number | null;
  height: number | null;
}

export interface IVendor {
  _id: Types.ObjectId;
  vendor: Types.ObjectId;
  location?: string;
  licenceNumber?: string;
  profile?: IVendorImage;
  nidFrontImage?: IVendorImage;
  nidBackImage?: IVendorImage;
  status: TVendorStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUpdateVendorProfileInput {
  name?: string;
  email?: string;
  location?: string;
  licenceNumber?: string;
}

export interface IVendorQueryOptions {
  page?: number;
  limit?: number;
  skip?: number;
  search?: string;
  status?: TVendorStatus | "ALL";
  tab?: "requests" | "approved" | "all";
}

export interface IVendorStatistics {
  vendorList: number;
  vendorRequests: number;
  rejected: number;
  suspended: number;
  pending: number;
}
