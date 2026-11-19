export type VendorStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export interface IVendor {
  _id: string;
  vendor: {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt?: string;
  };
  shopName?: string;
  location?: string;
  licenceNumber?: string;
  status: VendorStatus;
  profile?: {
    url?: string;
    publicId?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
