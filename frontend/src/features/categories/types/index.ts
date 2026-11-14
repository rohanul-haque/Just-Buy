export interface CategoryImage {
  publicId?: string;
  url: string;
  width?: number | null;
  height?: number | null;
}

export interface Category {
  _id: string;
  name: string;
  image?: CategoryImage;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CategoryQueryParams {
  search?: string;
  isActive?: boolean;
}

