import apiClient from "@/api/client";
import type { ApiResponse } from "@/types/api";

export interface IVerifyOtpPayload {
  email: string;
  otp: string;
}

export interface IResendOtpPayload {
  email: string;
}

export const verificationService = {
  verifyOtp: async (
    payload: IVerifyOtpPayload,
  ): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(
      "/verification/verify-otp",
      payload,
    );
    return response.data;
  },

  resendOtp: async (
    payload: IResendOtpPayload,
  ): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(
      "/verification/resend-otp",
      payload,
    );
    return response.data;
  },
};

export default verificationService;
