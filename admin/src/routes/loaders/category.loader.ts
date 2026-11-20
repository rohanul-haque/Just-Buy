import categoryService from "@/api/services/category.service";
import type { ICategory } from "@/types/category";

export interface CategoryLoaderData {
  categories: ICategory[];
}

export const categoriesLoader = async (): Promise<CategoryLoaderData> => {
  const response = await categoryService.getAllCategories({ isActive: "all" });
  return {
    categories: response.data || [],
  };
};

export default categoriesLoader;
