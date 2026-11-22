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
    try {
      const response = await apiClient.get<ApiResponse<IProduct>>(
        `/products/${id}`,
      );
      return response.data;
    } catch (err) {
      // Fallback for vendor's own products if public endpoint filtered inactive product
      const myProductsRes = await apiClient.get<ApiResponse<IProduct[]>>(
        "/products/my-products",
        { params: { limit: 100 } },
      );
      const found = myProductsRes.data?.data?.find((p) => p._id === id);
      if (found) {
        return {
          statusCode: 200,
          success: true,
          message: "Product retrieved successfully",
          data: found,
        };
      }
      throw err;
    }
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
