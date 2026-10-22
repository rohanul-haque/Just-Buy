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
 * User Role
 */
export const userRoleSchema = z
  .enum(["buyer", "seller", "admin"], {
    error: "Invalid role",
  })
  .default("buyer");

/**
 * User Registar Validation Schema
 */
export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters long")
    .max(50, "Full name must be less than 50 characters")
    .trim(),
  email: z
    .string()
    .email("Invalid email address")
    .max(254, "Email must be less than 254 characters")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters"),

  role: userRoleSchema,
});

/**
 * User Login Validation Schema
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(1, "Password is Required"),
});

/**
 * User Forgot Password Validation Schema
 */
export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email address"),
});

/**
 * User Reset Password Validation Schema
 */
export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().trim().length(6, "OTP must be 6 digits"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password cannot exceed 128 characters"),
});
