import api from "@/lib/axios";
import type { Wishlist } from "@/features/wishlist/types";

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export const wishlistService = {
  /**
   * Fetch current buyer's wishlist
   */
  async getWishlist(): Promise<Wishlist> {
    const response = await api.get<ApiResponse<Wishlist>>("/wishlist");
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to load wishlist");
    }
    return response.data.data;
  },

  /**
   * Add a product to the wishlist
   */
  async addToWishlist(productId: string): Promise<Wishlist> {
    const response = await api.post<ApiResponse<Wishlist>>("/wishlist/items", {
      productId,
    });
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to add to wishlist");
    }
    return response.data.data;
  },

  /**
   * Remove a product from the wishlist
   */
  async removeFromWishlist(productId: string): Promise<Wishlist> {
    const response = await api.delete<ApiResponse<Wishlist>>(
      `/wishlist/items/${productId}`,
    );
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to remove from wishlist");
    }
    return response.data.data;
  },
};

