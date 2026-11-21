export interface ICategoryImage {
  publicId: string;
  url: string;
  width: number | null;
  height: number | null;
}

export interface ICategory {
  _id: string;
  admin:
    | {
        _id?: string;
        name?: string;
        email?: string;
      }
    | string;
  name: string;
  image: ICategoryImage;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICategoryQuery {
  search?: string;
  isActive?: boolean | "all";
  sort?: string;
}

export interface ICategoryStatistics {
  activeCategories: number;
  inactiveCategories: number;
}
