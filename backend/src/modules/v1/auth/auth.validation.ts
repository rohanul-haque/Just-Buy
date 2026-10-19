/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Module
 */
import { z } from "zod";

/**
 * User Roles
 */
export const userRoleSchema = z.enum(["buyer", "seller", "admin"]);

/**
 * User Registar Validation Schema
 */
export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name is required")
    .max(50, "Full name cannot exceed 50 characters")
    .trim(),

  email: z
    .string()
    .email("Email is required")
    .max(254, "Email cannot exceed 254 characters")
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password cannot exceed 128 characters"),

  role: userRoleSchema.default("buyer"),
});

/**
 * Login Validation Schema
 */
export const loginSchema = z.object({
  email: z.string().email("Email is required").trim().toLowerCase(),

  password: z.string().min(1, "Password is required"),
});

/**
 * Refresh Token Validation Schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

/**
 * Forgot Password Validation Schema
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email("Email is required").trim().toLowerCase(),
});

/**
 * Reset Password Validation Schema
 */
export const resetPasswordSchema = z.object({
  email: z.string().email("Email is required").trim().toLowerCase(),
  otp: z.coerce.string().trim().length(6, "OTP must be 6 digits"),
  newPassword: z.coerce
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password cannot exceed 128 characters"),
});

/**
 * Types
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
