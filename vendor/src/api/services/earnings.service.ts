import apiClient from "@/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  IVendorEarningsSummary,
  IVendorEarningsTransaction,
  IVendorEarningsTransactionDetails,
} from "@/types/earnings";

export interface EarningsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const earningsService = {
  getEarningsSummary: async (): Promise<ApiResponse<IVendorEarningsSummary>> => {
    const response = await apiClient.get<ApiResponse<IVendorEarningsSummary>>(
      "/earnings/vendor/summary",
    );
    return response.data;
  },

  getEarningsTransactions: async (
    params?: EarningsQueryParams,
  ): Promise<ApiResponse<IVendorEarningsTransaction[]>> => {
    const response = await apiClient.get<
      ApiResponse<IVendorEarningsTransaction[]>
    >("/earnings/vendor", {
      params,
    });
    return response.data;
  },

  getEarningsTransactionDetails: async (
    orderId: string,
  ): Promise<ApiResponse<IVendorEarningsTransactionDetails>> => {
    const response = await apiClient.get<
      ApiResponse<IVendorEarningsTransactionDetails>
    >(`/earnings/vendor/${orderId}`);
    return response.data;
  },
};

export default earningsService;
