import apiClient from "@/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  IVendorDashboardOverview,
  IVendorRecentSale,
} from "@/types/dashboard";

export const dashboardService = {
  getVendorOverview: async (): Promise<
    ApiResponse<IVendorDashboardOverview>
  > => {
    const response = await apiClient.get<ApiResponse<IVendorDashboardOverview>>(
      "/dashboard/vendor/overview",
    );
    return response.data;
  },

  getVendorRecentSales: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<IVendorRecentSale[]>> => {
    const response = await apiClient.get<ApiResponse<IVendorRecentSale[]>>(
      "/dashboard/vendor/recent-sales",
      { params },
    );
    return response.data;
  },
};

export default dashboardService;
