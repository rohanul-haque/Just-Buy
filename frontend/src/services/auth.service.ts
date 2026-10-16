/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

import api from "@/lib/axios";
import axios from "axios";
import { getApiErrorMessage } from "@/lib/api-error";
import type {
  ApiResponse,
  UserResponse,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  VerifyOtpPayload,
  ResetPasswordPayload,
} from "@/types";

export { getApiErrorMessage };

export type {
  ApiResponse,
  UserResponse,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  VerifyOtpPayload,
  ResetPasswordPayload,
};

/**
 * Authentication Service
 */
export const authService = {
  /**
   * User registration
   */
  async register(payload: RegisterPayload): Promise<ApiResponse<{ user: UserResponse }>> {
    const response = await api.post<ApiResponse<{ user: UserResponse }>>(
      "/auth/register",
      {
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password,
        role: payload.role,
      },
    );
    return response.data;
  },

  /**
   * User login
   */
  async login(payload: LoginPayload): Promise<ApiResponse<{ user: UserResponse }>> {
    const response = await api.post<ApiResponse<{ user: UserResponse }>>(
      "/auth/login",
      {
        email: payload.email,
        password: payload.password,
      },
    );
    return response.data;
  },

  /**
   * Request password reset OTP
   */
  async forgotPassword(payload: ForgotPasswordPayload): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>(
      "/auth/forgot-password",
      {
        email: payload.email,
      },
    );
    return response.data;
  },

  /**
   * Resend OTP (calls forgot-password endpoint)
   */
  async resendOtp(payload: ForgotPasswordPayload): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>(
      "/auth/forgot-password",
      {
        email: payload.email,
      },
    );
    return response.data;
  },

  /**
   * Verify OTP
   * Note: The backend currently validates OTP during reset-password.
   * If a dedicated /auth/verify-otp endpoint is added, this will call it directly.
   */
  async verifyOtp(payload: VerifyOtpPayload): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>("/auth/verify-otp", payload);
      return response.data;
    } catch (error) {
      // If the backend has not yet registered the dedicated verify-otp route,
      // fallback gracefully to proceed to the reset-password step where the backend validates OTP.
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return {
          statusCode: 200,
          success: true,
          message: "OTP entered successfully",
        };
      }
      throw error;
    }
  },

  /**
   * Reset user password
   */
  async resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>(
      "/auth/reset-password",
      {
        email: payload.email,
        otp: payload.otp,
        newPassword: payload.newPassword,
      },
    );
    return response.data;
  },

  /**
   * User logout
   */
  async logout(): Promise<ApiResponse> {
    const response = await api.get<ApiResponse>("/auth/logout");
    return response.data;
  },
};
