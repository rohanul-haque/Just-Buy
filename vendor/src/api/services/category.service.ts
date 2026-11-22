import apiClient from "@/api/client";
import type { ApiResponse } from "@/types/api";
import type { ICategory, ICategoryQuery } from "@/types/category";

export const categoryService = {
  getAllCategories: async (
    query?: ICategoryQuery,
  ): Promise<ApiResponse<ICategory[]>> => {
    const response = await apiClient.get<ApiResponse<ICategory[]>>(
      "/categories",
      {
        params: query,
      },
    );
    return response.data;
  },

  getCategoryById: async (id: string): Promise<ApiResponse<ICategory>> => {
    const response = await apiClient.get<ApiResponse<ICategory>>(
      `/categories/${id}`,
    );
    return response.data;
  },
};

export default categoryService;
