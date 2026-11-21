import categoryService from "@/api/services/category.service";
import type { ICategory, ICategoryStatistics } from "@/types/category";

export interface CategoryLoaderData {
  categories: ICategory[];
  statistics?: ICategoryStatistics;
}

export const categoriesLoader = async (): Promise<CategoryLoaderData> => {
  try {
    const [response, statsRes] = await Promise.all([
      categoryService.getAllCategories({ isActive: "all" }),
      categoryService.getCategoryStatistics().catch(() => ({
        data: { activeCategories: 0, inactiveCategories: 0 },
      })),
    ]);

    return {
      categories: response.data || [],
      statistics: statsRes.data || { activeCategories: 0, inactiveCategories: 0 },
    };
  } catch {
    return {
      categories: [],
      statistics: { activeCategories: 0, inactiveCategories: 0 },
    };
  }
};

export default categoriesLoader;
