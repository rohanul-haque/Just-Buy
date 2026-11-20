export type VendorStatus =
  | "NOT_SUBMITTED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";

export interface IVendorUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt?: string;
  verification?: {
    isEmailVerified?: boolean;
  };
}

export interface IVendorImage {
  publicId?: string;
  url?: string;
  width?: number | null;
  height?: number | null;
}

export interface IVendor {
  _id: string;
  vendor: IVendorUser;
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

export interface IVendorPagination {
  page?: number;
  skip?: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type TVendorCategory =
  | "list"
  | "requests"
  | "rejected"
  | "suspended"
  | "pending";

export interface VendorLoaderData {
  vendors: IVendor[];
  pagination: IVendorPagination | null;
  category: TVendorCategory;
  tab: "requests" | "list";
  search: string;
  status: string;
  page: number;
}

export interface VendorActionResult {
  success: boolean;
  message?: string;
  error?: string;
  intent?: "approve" | "reject" | "suspend" | "unsuspend" | "delete";
  data?: IVendor;
}
