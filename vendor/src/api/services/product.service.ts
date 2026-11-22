import apiClient from "@/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  IProduct,
  IProductQueryOptions,
  IPaginatedProductsResult,
} from "@/types/product";

export const productService = {
  getMyProducts: async (
    options?: IProductQueryOptions,
  ): Promise<
    ApiResponse<IProduct[]> & {
      pagination?: IPaginatedProductsResult["pagination"];
    }
  > => {
    const response = await apiClient.get<
      ApiResponse<IProduct[]> & {
        pagination?: IPaginatedProductsResult["pagination"];
      }
    >("/products/my-products", {
      params: options,
    });
    return response.data;
  },

  getProductById: async (id: string): Promise<ApiResponse<IProduct>> => {
    const response = await apiClient.get<ApiResponse<IProduct>>(
      `/products/${id}`,
    );
    return response.data;
  },

  createProduct: async (data: FormData): Promise<ApiResponse<IProduct>> => {
    const response = await apiClient.post<ApiResponse<IProduct>>(
      "/products",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  updateMyProduct: async (
    id: string,
    data: FormData,
  ): Promise<ApiResponse<IProduct>> => {
    const response = await apiClient.patch<ApiResponse<IProduct>>(
      `/products/my-products/${id}`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  deleteMyProduct: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/products/my-products/${id}`,
    );
    return response.data;
  },
};

export default productService;
