"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/features/auth/services/auth-service";
import type {
  RegisterInput,
  LoginInput,
  LoginResponseData,
  VerifyOtpInput,
  ResendOtpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/features/auth/types";
import type { ApiResponse, ApiErrorResponse } from "@/lib/api-error";

export const AUTH_QUERY_KEY = ["auth", "me"] as const;

/**
 * Hook to retrieve the currently authenticated user
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: () => authService.getMe(),
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for registration mutation
 */
export function useRegister() {
  return useMutation<unknown, ApiErrorResponse, RegisterInput>({
    mutationFn: (data) => authService.register(data),
  });
}

/**
 * Hook for login mutation
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<LoginResponseData>, ApiErrorResponse, LoginInput>({
    mutationFn: (data) => authService.login(data),
    onSuccess: (response) => {
      const user = response?.data?.user;
      if (user) {
        queryClient.setQueryData(AUTH_QUERY_KEY, user);
      }
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
}

/**
 * Hook for account verification mutation
 */
export function useVerifyOtp() {
  return useMutation<unknown, ApiErrorResponse, VerifyOtpInput>({
    mutationFn: (data) => authService.verifyOtp(data),
  });
}

/**
 * Hook for resending verification OTP
 */
export function useResendOtp() {
  return useMutation<unknown, ApiErrorResponse, ResendOtpInput>({
    mutationFn: (data) => authService.resendOtp(data),
  });
}

/**
 * Hook for forgot password mutation
 */
export function useForgotPassword() {
  return useMutation<unknown, ApiErrorResponse, ForgotPasswordInput>({
    mutationFn: (data) => authService.forgotPassword(data),
  });
}

/**
 * Hook for reset password mutation
 */
export function useResetPassword() {
  return useMutation<unknown, ApiErrorResponse, ResetPasswordInput>({
    mutationFn: (data) => authService.resetPassword(data),
  });
}

/**
 * Hook for logout mutation
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<unknown, ApiErrorResponse, void>({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("justbuy_auth_active");
      }
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY });
      queryClient.clear();
      router.push("/");
    },
    onError: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("justbuy_auth_active");
      }
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY });
      queryClient.clear();
      router.push("/");
    },
  });
}

