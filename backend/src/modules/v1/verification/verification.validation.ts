import { z } from "zod";

const emailSchema = z
  .string({ message: "Email is required" })
  .trim()
  .email({ message: "Invalid email address format" })
  .transform((val) => val.toLowerCase());

export const sendOtpSchema = z.object({
  email: emailSchema,
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: z
    .string({ message: "OTP is required" })
    .trim()
    .regex(/^\d{5}$/, { message: "OTP must contain exactly 5 numeric digits" }),
});

export const resendOtpSchema = z.object({
  email: emailSchema,
});

export type TSendOtpInput = z.infer<typeof sendOtpSchema>;
export type TVerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type TResendOtpInput = z.infer<typeof resendOtpSchema>;
