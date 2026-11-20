export interface IBuyerUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: "ACTIVE" | "BLOCKED";
  createdAt?: string;
}

export interface IBuyerProfileImage {
  publicId?: string;
  url?: string;
  width?: number | null;
  height?: number | null;
}

export interface IBuyer {
  _id: string;
  buyer: IBuyerUser;
  phoneNumber?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  profile?: IBuyerProfileImage;
  createdAt?: string;
  updatedAt?: string;
}

export interface IBuyerPagination {
  page?: number;
  skip?: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface BuyerLoaderData {
  buyers: IBuyer[];
  pagination: IBuyerPagination | null;
  search: string;
  status: string;
  page: number;
}

export interface BuyerActionResult {
  success: boolean;
  message?: string;
  error?: string;
  intent?: "block" | "unblock" | "delete";
  data?: IBuyer;
}
