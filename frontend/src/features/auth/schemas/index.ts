import { z } from "zod";

export const registerFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: "Name must be at least 2 characters" })
      .max(100, { message: "Name cannot exceed 100 characters" }),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email({ message: "Invalid email address format" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" })
      .max(128, { message: "Password cannot exceed 128 characters" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email address format" }),
  password: z
    .string()
    .min(1, { message: "Password is required" }),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const verifyOtpFormSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email address format" }),
  otp: z
    .string()
    .trim()
    .regex(/^\d{5}$/, { message: "OTP must contain exactly 5 numeric digits" }),
});

export type VerifyOtpFormValues = z.infer<typeof verifyOtpFormSchema>;

export const resendOtpFormSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email address format" }),
});

export type ResendOtpFormValues = z.infer<typeof resendOtpFormSchema>;

export const forgotPasswordFormSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email address format" }),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export const resetPasswordFormSchema = z
  .object({
    token: z
      .string()
      .trim()
      .min(1, { message: "Reset token is required" }),
    newPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" })
      .max(128, { message: "Password cannot exceed 128 characters" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your new password" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

