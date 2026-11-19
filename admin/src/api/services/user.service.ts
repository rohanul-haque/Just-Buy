import apiClient from "@/api/client";
import type { ApiResponse, PaginationParams } from "@/types/api";
import type { IBuyer } from "@/types/user";

export const userService = {
  getAllBuyers: async (
    params?: PaginationParams,
  ): Promise<ApiResponse<IBuyer[]>> => {
    const response = await apiClient.get<ApiResponse<IBuyer[]>>("/buyers", {
      params,
    });
    return response.data;
  },

  getBuyerById: async (id: string): Promise<ApiResponse<IBuyer>> => {
    const response = await apiClient.get<ApiResponse<IBuyer>>(`/buyers/${id}`);
    return response.data;
  },

  updateBuyerStatus: async (
    buyerId: string,
    status: "ACTIVE" | "BLOCKED",
  ): Promise<ApiResponse<IBuyer>> => {
    const response = await apiClient.patch<ApiResponse<IBuyer>>(
      `/buyers/${buyerId}/status`,
      { status },
    );
    return response.data;
  },
};

export default userService;
