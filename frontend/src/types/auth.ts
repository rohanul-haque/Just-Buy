/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

import React from "react";

/**
 * User Roles
 */
export type UserRole = "buyer" | "seller" | "admin";

/**
 * User data returned by backend
 */
export interface UserResponse {
  fullName: string;
  email: string;
  role: UserRole;
  contactNumber?: string;
  address?: string;
}

/**
 * Standard API Success Response
 */
export interface ApiResponse<T = unknown> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
}

/**
 * API Error detail from validation
 */
export interface ApiValidationError {
  field?: string;
  message: string;
}

/**
 * Standard API Error Response
 */
export interface ApiErrorResponse {
  statusCode?: number;
  success: boolean;
  code?: string;
  message: string;
  errors?: ApiValidationError[];
  stack?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}


/**
 * Register Request Payload
 */
export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role?: UserRole;
}

/**
 * Forgot Password Request Payload
 */
export interface ForgotPasswordPayload {
  email: string;
}

/**
 * Verify OTP Request Payload
 */
export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

/**
 * Reset Password Request Payload
 */
export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

/**
 * Auth Layout Component Props
 */
export interface AuthLayoutProps {
  children: React.ReactNode;
  illustration?: React.ReactNode;
  showLogo?: boolean;
  className?: string;
  variant?: "split" | "card";
  badgeText?: string;
}

/**
 * Auth Header Component Props
 */
export interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  className?: string;
}

/**
 * Illustration Component Props
 */
export interface IllustrationProps {
  imageSrc?: string;
  alt?: string;
  className?: string;
}