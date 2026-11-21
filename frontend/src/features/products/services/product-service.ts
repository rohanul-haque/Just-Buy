import api from "@/lib/axios";
import type {
  Product,
  ProductQueryParams,
  PaginatedProductsResponse,
} from "@/features/products/types";

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const productService = {
  /**
   * Fetch paginated public product catalog with optional query filters
   */
  async getPublicProducts(
    params?: ProductQueryParams,
  ): Promise<PaginatedProductsResponse> {
    const response = await api.get<ApiResponse<Product[]>>("/products", {
      params,
    });

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to load products");
    }

    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  /**
   * Fetch exactly N new arrival products (default 4)
   */
  async getNewArrivals(limit: number = 4): Promise<Product[]> {
    const response = await api.get<ApiResponse<Product[]>>(
      "/products/new-arrivals",
      {
        params: { limit },
      },
    );

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to load new arrivals");
    }

    return response.data.data;
  },

  /**
   * Fetch explore products for homepage (default 8)
   */
  async getExploreProducts(limit: number = 8): Promise<Product[]> {
    const response = await api.get<ApiResponse<Product[]>>("/products", {
      params: { limit, page: 1 },
    });

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to load explore products");
    }

    return response.data.data;
  },

  /**
   * Fetch a single product by its ID
   */
  async getProductById(productId: string): Promise<Product> {
    const response = await api.get<ApiResponse<Product>>(
      `/products/${productId}`,
    );

    if (!response.data.data) {
      throw new Error(response.data.message || "Product not found");
    }

    return response.data.data;
  },

  /**
   * Fetch related products for a product (default 4)
   */
  async getRelatedProducts(
    productId: string,
    limit: number = 4,
  ): Promise<Product[]> {
    const response = await api.get<ApiResponse<Product[]>>(
      `/products/${productId}/related`,
      {
        params: { limit },
      },
    );

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to load related products");
    }

    return response.data.data;
  },
};

