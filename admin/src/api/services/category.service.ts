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

  createCategory: async (
    data: FormData,
  ): Promise<ApiResponse<ICategory>> => {
    const response = await apiClient.post<ApiResponse<ICategory>>(
      "/categories",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  updateCategory: async (
    id: string,
    data: FormData | { name?: string; isActive?: boolean },
  ): Promise<ApiResponse<ICategory>> => {
    const isFormData = data instanceof FormData;
    const response = await apiClient.patch<ApiResponse<ICategory>>(
      `/categories/${id}`,
      data,
      isFormData
        ? {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        : undefined,
    );
    return response.data;
  },

  deleteCategory: async (
    id: string,
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/categories/${id}`,
    );
    return response.data;
  },

  updateCategoryStatus: async (
    id: string,
    isActive: boolean,
  ): Promise<ApiResponse<ICategory>> => {
    const response = await apiClient.patch<ApiResponse<ICategory>>(
      `/categories/${id}/status`,
      { isActive },
    );
    return response.data;
  },
};

export default categoryService;
