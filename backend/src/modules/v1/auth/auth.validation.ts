import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({
      message: "Name is required",
    })
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name cannot exceed 100 characters" }),

  email: z
    .string({
      message: "Email is required",
    })
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email address" }),

  password: z
    .string({
      message: "Password is required",
    })
    .min(6, { message: "Password must be at least 6 characters" })
    .max(128, { message: "Password cannot exceed 128 characters" }),

  role: z
    .enum(["BUYER", "VENDOR", "ADMIN"], {
      message:
        "Role must be either BUYER or VENDOR. Admin accounts cannot be created publicly.",
    })
    .optional(),
});

export const loginSchema = z.object({
  email: z
    .string({
      message: "Email is required",
    })
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email address" }),

  password: z
    .string({
      message: "Password is required",
    })
    .min(1, { message: "Password is required" }),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({
      message: "Email is required",
    })
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email address" }),
});

export const resetPasswordSchema = z.object({
  token: z
    .string({
      message: "Reset token is required",
    })
    .trim()
    .min(1, { message: "Reset token is required" }),

  newPassword: z
    .string({
      message: "New password is required",
    })
    .min(6, { message: "New password must be at least 6 characters" })
    .max(128, { message: "New password cannot exceed 128 characters" }),
});

export const refreshTokenSchema = z
  .object({
    refreshToken: z.string().optional(),
  })
  .optional();
