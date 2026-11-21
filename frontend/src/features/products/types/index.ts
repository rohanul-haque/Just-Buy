export type ProductSize = "S" | "M" | "L" | "XL" | "XXL";

export interface ProductImage {
  publicId?: string;
  url: string;
  width?: number | null;
  height?: number | null;
}

export interface ProductVendor {
  _id: string;
  shopName?: string;
  location?: string;
  profile?: { url?: string };
}

export interface ProductCategory {
  _id: string;
  name: string;
  image?: { url?: string };
}

export interface Product {
  _id: string;
  vendor?: ProductVendor;
  category?: ProductCategory;
  name: string;
  description: string;
  brand?: string;
  price: number;
  stock: number;
  sizes?: ProductSize[];
  featureImage?: ProductImage;
  images?: ProductImage[];
  salesCount?: number;
  isActive: boolean;
  isFeatured?: boolean;
  rating?: number;
  numReviews?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  skip?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
}

export interface PaginatedProductsResponse {
  data: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
