import api from "@/lib/axios";
import type { ApiResponse } from "@/lib/api-error";
import type { Category, CategoryQueryParams } from "@/features/categories/types";

export const categoryService = {
  /**
   * Fetch all active categories
   */
  async getCategories(params?: CategoryQueryParams): Promise<Category[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.isActive !== undefined) {
      query.append("isActive", String(params.isActive));
    }

    const response = await api.get<ApiResponse<Category[]>>(
      `/categories${query.toString() ? `?${query.toString()}` : ""}`,
    );

    return response.data.data || [];
  },

  /**
   * Fetch category details by ID
   */
  async getCategoryById(categoryId: string): Promise<Category> {
    const response = await api.get<ApiResponse<Category>>(
      `/categories/${categoryId}`,
    );
    if (!response.data.data) {
      throw new Error("Category not found");
    }
    return response.data.data;
  },
};

