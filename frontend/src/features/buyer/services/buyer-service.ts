import api from "@/lib/axios";
import type { ApiResponse } from "@/lib/api-error";
import type {
  BuyerProfile,
  UpdateBuyerProfileInput,
  Order,
  OrdersPagination,
  CreateOrderInput,
  CreateOrderResponse,
  VerifySessionResponse,
} from "@/features/buyer/types";

export interface PaginatedOrdersResponse extends ApiResponse<Order[]> {
  pagination?: OrdersPagination;
}

export const buyerService = {
  /**
   * Retrieve authenticated buyer's full profile
   */
  async getProfile(): Promise<BuyerProfile> {
    const response = await api.get<ApiResponse<BuyerProfile>>("/buyers/me");
    if (!response.data.data) {
      throw new Error("No buyer profile data received");
    }
    return response.data.data;
  },

  /**
   * Update buyer's profile info and/or upload a new avatar
   */
  async updateProfile(payload: UpdateBuyerProfileInput): Promise<BuyerProfile> {
    const formData = new FormData();

    if (payload.phoneNumber !== undefined) {
      formData.append("phoneNumber", payload.phoneNumber.trim());
    }
    if (payload.gender) {
      formData.append("gender", payload.gender);
    }
    if (payload.address !== undefined) {
      formData.append("address", payload.address.trim());
    }
    if (payload.profileImage instanceof File) {
      formData.append("profile", payload.profileImage);
    }

    const response = await api.patch<ApiResponse<BuyerProfile>>(
      "/buyers/me",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    if (!response.data.data) {
      throw new Error("Failed to update buyer profile");
    }
    return response.data.data;
  },

  /**
   * Retrieve orders for the authenticated buyer
   */
  async getMyOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<{ orders: Order[]; pagination?: OrdersPagination }> {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    if (params.status) query.append("status", params.status);

    const response = await api.get<PaginatedOrdersResponse>(
      `/orders/my-orders${query.toString() ? `?${query.toString()}` : ""}`,
    );

    return {
      orders: response.data.data || [],
      pagination: response.data.pagination,
    };
  },

  /**
   * Retrieve single order detail
   */
  async getOrderById(orderId: string): Promise<Order> {
    const response = await api.get<ApiResponse<Order>>(`/orders/${orderId}`);
    if (!response.data.data) {
      throw new Error("Order not found");
    }
    return response.data.data;
  },

  /**
   * Cancel an eligible pending/processing order
   */
  async cancelOrder(orderId: string): Promise<Order> {
    const response = await api.patch<ApiResponse<Order>>(
      `/orders/${orderId}/cancel`,
      {},
    );
    if (!response.data.data) {
      throw new Error("Failed to cancel order");
    }
    return response.data.data;
  },

  /**
   * Create a new order (COD or Online via Stripe)
   */
  async createOrder(payload: CreateOrderInput): Promise<CreateOrderResponse> {
    const response = await api.post<ApiResponse<CreateOrderResponse>>(
      "/orders",
      payload,
    );
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to create order");
    }
    return response.data.data;
  },

  /**
   * Verify Stripe checkout session status from backend
   */
  async verifySession(sessionId: string): Promise<VerifySessionResponse> {
    const response = await api.get<ApiResponse<VerifySessionResponse>>(
      `/payments/verify-session?session_id=${encodeURIComponent(sessionId)}`,
    );
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to verify session");
    }
    return response.data.data;
  },
};
