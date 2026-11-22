import apiClient from "@/api/client";
import type { ApiResponse } from "@/types/api";
import type { IVendor } from "@/types/vendor";

export const vendorService = {
  getOwnProfile: async (): Promise<ApiResponse<IVendor>> => {
    const response = await apiClient.get<ApiResponse<IVendor>>("/vendors/me");
    return response.data;
  },

  updateOwnProfile: async (
    formData: FormData,
  ): Promise<ApiResponse<IVendor>> => {
    const response = await apiClient.patch<ApiResponse<IVendor>>(
      "/vendors/me",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },
};

export default vendorService;
