import type { Types } from "mongoose";

export interface IVerification {
  user: Types.ObjectId;
  otp?: string;
  isEmailVerified: boolean;
  emailVerifiedAt?: Date | null;
  attempts: number;
  expiresAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISendOtpInput {
  email: string;
}

export interface IVerifyOtpInput {
  email: string;
  otp: string;
}

export interface IResendOtpInput {
  email: string;
}

export interface IVerificationResponse {
  message: string;
}
