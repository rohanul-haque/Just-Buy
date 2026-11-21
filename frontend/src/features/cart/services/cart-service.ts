import api from "@/lib/axios";
import type {
  Cart,
  AddToCartInput,
  UpdateCartItemInput,
} from "@/features/cart/types";

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export const cartService = {
  /**
   * Fetch current buyer's cart
   */
  async getCart(): Promise<Cart> {
    const response = await api.get<ApiResponse<Cart>>("/cart");
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to load cart");
    }
    return response.data.data;
  },

  /**
   * Add a product item to buyer's cart
   */
  async addToCart(payload: AddToCartInput): Promise<Cart> {
    const response = await api.post<ApiResponse<Cart>>("/cart/items", payload);
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to add item to cart");
    }
    return response.data.data;
  },

  /**
   * Update quantity of a cart item
   */
  async updateCartItem(payload: UpdateCartItemInput): Promise<Cart> {
    const response = await api.patch<ApiResponse<Cart>>(
      `/cart/items/${payload.itemId}`,
      { quantity: payload.quantity },
    );
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to update cart item");
    }
    return response.data.data;
  },

  /**
   * Remove an item from the cart
   */
  async removeCartItem(itemId: string): Promise<Cart> {
    const response = await api.delete<ApiResponse<Cart>>(
      `/cart/items/${itemId}`,
    );
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to remove cart item");
    }
    return response.data.data;
  },
};

