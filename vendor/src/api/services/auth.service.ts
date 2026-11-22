import apiClient from "@/api/client";
import type { ApiResponse } from "@/types/api";
import type { IUser } from "@/types/user";

export const authService = {
  getMe: async (): Promise<ApiResponse<IUser>> => {
    const response = await apiClient.get<ApiResponse<IUser>>("/auth/me");
    return response.data;
  },

  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>(
        "/auth/logout",
      );
      return response.data;
    } finally {
      localStorage.removeItem("jus_buy_vendor_token");
    }
  },
};

export default authService;
