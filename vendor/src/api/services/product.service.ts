import apiClient from "@/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  IProduct,
  IProductQueryOptions,
  IProductStatistics,
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

  getVendorProductStatistics: async (): Promise<
    ApiResponse<IProductStatistics>
  > => {
    try {
      const response = await apiClient.get<ApiResponse<IProductStatistics>>(
        "/products/my-products/statistics",
      );
      if (response.data && response.data.success && response.data.data) {
        return response.data;
      }
      throw new Error("Statistics endpoint returned empty data");
    } catch {
      // Fallback: Query my products with limit=1 to read pagination total
      const [all, active, inactive] = await Promise.all([
        apiClient.get<ApiResponse<any>>("/products/my-products?limit=1"),
        apiClient.get<ApiResponse<any>>(
          "/products/my-products?isActive=true&limit=1",
        ),
        apiClient.get<ApiResponse<any>>(
          "/products/my-products?isActive=false&limit=1",
        ),
      ]);
      return {
        success: true,
        statusCode: 200,
        message: "Vendor product statistics fetched successfully",
        data: {
          totalProducts: all.data?.pagination?.total ?? 0,
          activeProducts: active.data?.pagination?.total ?? 0,
          inactiveProducts: inactive.data?.pagination?.total ?? 0,
        },
      };
    }
  },

  updateProductStatus: async (
    id: string,
    isActive: boolean,
  ): Promise<ApiResponse<IProduct>> => {
    const formData = new FormData();
    formData.append("isActive", String(isActive));

    const response = await apiClient.patch<ApiResponse<IProduct>>(
      `/products/my-products/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },
};

export default productService;
