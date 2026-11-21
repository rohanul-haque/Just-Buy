import apiClient from "@/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  IDashboardSummary,
  IMonthlyEarning,
  IOrderDistribution,
  IRecentUsersResponse,
  IUserDetails,
} from "@/types/dashboard";

export const dashboardService = {
  getSummary: async (): Promise<ApiResponse<IDashboardSummary>> => {
    const response = await apiClient.get<ApiResponse<IDashboardSummary>>(
      "/admin/dashboard/summary",
    );
    return response.data;
  },

  getMonthlyEarnings: async (): Promise<ApiResponse<IMonthlyEarning[]>> => {
    const response = await apiClient.get<ApiResponse<IMonthlyEarning[]>>(
      "/admin/dashboard/monthly-earnings",
    );
    return response.data;
  },

  getOrderDistribution: async (): Promise<ApiResponse<IOrderDistribution[]>> => {
    const response = await apiClient.get<ApiResponse<IOrderDistribution[]>>(
      "/admin/dashboard/order-distribution",
    );
    return response.data;
  },

  getRecentUsers: async (
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<IRecentUsersResponse>> => {
    const response = await apiClient.get<ApiResponse<IRecentUsersResponse>>(
      "/admin/dashboard/recent-users",
      {
        params: { page, limit },
      },
    );
    return response.data;
  },

  getUserDetails: async (
    userId: string,
  ): Promise<ApiResponse<IUserDetails>> => {
    const response = await apiClient.get<ApiResponse<IUserDetails>>(
      `/admin/dashboard/users/${userId}`,
    );
    return response.data;
  },
};

export default dashboardService;
