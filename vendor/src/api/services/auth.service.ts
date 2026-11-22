import apiClient from "@/api/client";
import type { ApiResponse } from "@/types/api";
import type { IUser } from "@/types/user";

export interface ILoginResponse {
  user: IUser;
  accessToken?: string;
  refreshToken?: string;
  redirectUrl?: string;
}

export const authService = {
  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<ILoginResponse>> => {
    const response = await apiClient.post<ApiResponse<ILoginResponse>>(
      "/auth/login",
      credentials,
    );
    if (response.data?.data?.accessToken) {
      localStorage.setItem(
        "jus_buy_vendor_token",
        response.data.data.accessToken,
      );
    }
    return response.data;
  },

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
