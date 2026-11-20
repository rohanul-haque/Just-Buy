import apiClient from "@/api/client";
import type { ApiResponse } from "@/types/api";
import type { IBuyer } from "@/types/buyer";

export interface GetBuyersParams {
  page?: number;
  limit?: number;
  search?: string;
  gender?: string;
  status?: "ACTIVE" | "BLOCKED" | string;
}

export const buyerService = {
  getAllBuyers: async (
    params?: GetBuyersParams,
  ): Promise<ApiResponse<IBuyer[]>> => {
    const response = await apiClient.get<ApiResponse<IBuyer[]>>("/buyers", {
      params,
    });
    return response.data;
  },

  getBuyerById: async (buyerId: string): Promise<ApiResponse<IBuyer>> => {
    const response = await apiClient.get<ApiResponse<IBuyer>>(`/buyers/${buyerId}`);
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

  deleteBuyer: async (buyerId: string): Promise<ApiResponse<IBuyer>> => {
    const response = await apiClient.delete<ApiResponse<IBuyer>>(`/buyers/${buyerId}`);
    return response.data;
  },
};

export default buyerService;
