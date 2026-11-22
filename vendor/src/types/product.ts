export interface IProductImage {
  publicId: string;
  url: string;
  width?: number | null;
  height?: number | null;
}

export interface IProductCategory {
  _id: string;
  name: string;
  image?: any;
  isActive?: boolean;
}

export interface IProduct {
  _id: string;
  vendor: string | { _id: string };
  category: IProductCategory | string;
  name: string;
  description: string;
  brand?: string;
  price: number;
  stock: number;
  sizes?: string[];
  featureImage: IProductImage;
  images?: IProductImage[];
  salesCount: number;
  isActive: boolean;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IProductQueryOptions {
  page?: number;
  limit?: number;
  skip?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
}

export interface IProductStatistics {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
}

export interface IPaginatedProductsResult {
  data: IProduct[];
  pagination: {
    page: number;
    limit: number;
    skip: number;
    total: number;
    totalPages: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
  };
}
