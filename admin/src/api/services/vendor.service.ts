import apiClient from "@/api/client";
import type { ApiResponse } from "@/types/api";
import type { IVendor, IVendorStatistics, VendorStatus } from "@/types/vendor";

export interface GetVendorsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: VendorStatus | "ALL" | string;
  tab?: "requests" | "approved" | "all" | string;
}

export const vendorService = {
  getAllVendors: async (
    params?: GetVendorsParams,
  ): Promise<ApiResponse<IVendor[]>> => {
    const response = await apiClient.get<ApiResponse<IVendor[]>>("/vendors", {
      params,
    });
    return response.data;
  },

  getVendorStatistics: async (): Promise<ApiResponse<IVendorStatistics>> => {
    const response = await apiClient.get<ApiResponse<IVendorStatistics>>(
      "/admin/vendors/statistics",
    );
    return response.data;
  },

  getVendorById: async (id: string): Promise<ApiResponse<IVendor>> => {
    const response = await apiClient.get<ApiResponse<IVendor>>(`/vendors/${id}`);
    return response.data;
  },

  updateVendorStatus: async (
    id: string,
    status: VendorStatus,
  ): Promise<ApiResponse<IVendor>> => {
    const response = await apiClient.patch<ApiResponse<IVendor>>(
      `/vendors/${id}/status`,
      { status },
    );
    return response.data;
  },

  deleteVendorRequest: async (id: string): Promise<ApiResponse<IVendor>> => {
    const response = await apiClient.delete<ApiResponse<IVendor>>(
      `/vendors/${id}`,
    );
    return response.data;
  },
};

export default vendorService;
