import apiClient from "@/api/client";
import type { ApiResponse, PaginationParams } from "@/types/api";
import type { IVendor, VendorStatus } from "@/types/vendor";

export const vendorService = {
  getAllVendors: async (
    params?: PaginationParams,
  ): Promise<ApiResponse<IVendor[]>> => {
    const response = await apiClient.get<ApiResponse<IVendor[]>>("/vendors", {
      params,
    });
    return response.data;
  },

  getVendorById: async (id: string): Promise<ApiResponse<IVendor>> => {
    const response = await apiClient.get<ApiResponse<IVendor>>(
      `/vendors/${id}`,
    );
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
};

export default vendorService;
