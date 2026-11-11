import api from "@/lib/axios";
import type { ApiResponse } from "@/lib/api-error";
import type {
  RegisterInput,
  RegisterResponseData,
  LoginInput,
  LoginResponseData,
  VerifyOtpInput,
  ResendOtpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  User,
} from "@/features/auth/types";

export const authService = {
  /**
   * Register a new buyer account
   */
  async register(
    payload: RegisterInput,
  ): Promise<ApiResponse<RegisterResponseData>> {
    const response = await api.post<ApiResponse<RegisterResponseData>>(
      "/auth/register",
      payload,
    );
    return response.data;
  },

  /**
   * Authenticate user with email and password
   */
  async login(payload: LoginInput): Promise<ApiResponse<LoginResponseData>> {
    const response = await api.post<ApiResponse<LoginResponseData>>(
      "/auth/login",
      payload,
    );
    return response.data;
  },

  /**
   * Rotate access and refresh tokens
   */
  async refreshToken(): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>(
      "/auth/refresh-token",
      {},
    );
    return response.data;
  },

  /**
   * Verify email using 5-digit numeric OTP
   */
  async verifyOtp(payload: VerifyOtpInput): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>(
      "/verification/verify-otp",
      payload,
    );
    return response.data;
  },

  /**
   * Resend verification OTP to email (subject to 60s cooldown)
   */
  async resendOtp(payload: ResendOtpInput): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>(
      "/verification/resend-otp",
      payload,
    );
    return response.data;
  },

  /**
   * Request password reset link/token via email
   */
  async forgotPassword(payload: ForgotPasswordInput): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>(
      "/auth/forgot-password",
      payload,
    );
    return response.data;
  },

  /**
   * Submit new password with reset token
   */
  async resetPassword(payload: ResetPasswordInput): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>(
      "/auth/reset-password",
      payload,
    );
    return response.data;
  },

  /**
   * Log out authenticated user, revoking session and clearing cookies
   */
  async logout(): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>("/auth/logout");
    return response.data;
  },

  /**
   * Retrieve current authenticated user profile
   */
  async getMe(): Promise<User | null> {
    try {
      const response = await api.get<{
        success: boolean;
        data: {
          buyer?: {
            _id: string;
            name: string;
            email: string;
            role: string;
            status: string;
          };
          phoneNumber?: string;
          gender?: string;
          address?: string;
          profile?: { url: string };
        };
      }>("/buyers/me");

      const raw = response.data?.data;
      if (!raw) return null;

      const buyerUser = raw.buyer;
      if (!buyerUser) return null;

      return {
        id: buyerUser._id,
        name: buyerUser.name,
        email: buyerUser.email,
        role: buyerUser.role as User["role"],
        isEmailVerified: true,
        avatar: raw.profile?.url,
      };
    } catch {
      return null;
    }
  },
};

