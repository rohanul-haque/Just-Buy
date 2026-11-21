import apiClient from "@/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  IEarningsSummary,
  IEarningsTransaction,
  IEarningsTransactionDetails,
} from "@/types/earnings";

export interface EarningsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const earningsService = {
  getEarningsSummary: async (): Promise<ApiResponse<IEarningsSummary>> => {
    const response =
      await apiClient.get<ApiResponse<IEarningsSummary>>("/earnings/summary");
    return response.data;
  },

  getEarningsTransactions: async (
    params?: EarningsQueryParams,
  ): Promise<ApiResponse<IEarningsTransaction[]>> => {
    const response = await apiClient.get<ApiResponse<IEarningsTransaction[]>>(
      "/earnings",
      {
        params,
      },
    );
    return response.data;
  },

  getEarningsTransactionDetails: async (
    orderId: string,
  ): Promise<ApiResponse<IEarningsTransactionDetails>> => {
    const response = await apiClient.get<
      ApiResponse<IEarningsTransactionDetails>
    >(`/earnings/${orderId}`);
    return response.data;
  },
};

export default earningsService;
