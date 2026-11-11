import config from "@/config";
import emailService from "@/modules/v1/auth/email/email.service";
import {
  clearVerificationOtpCooldown,
  deleteOtp,
  deleteOtpAttempts,
  isVerificationOtpInCooldown,
  setVerificationOtpCooldown,
} from "@/modules/v1/auth/redis/redis.service";
import User from "@/modules/v1/user/user.model";
import { VERIFICATION_MESSAGES } from "@/modules/v1/verification/verification.constant";
import type {
  IResendOtpInput,
  IVerificationResponse,
  IVerifyOtpInput,
} from "@/modules/v1/verification/verification.interface";
import Verification from "@/modules/v1/verification/verification.model";
import {
  compareOtp,
  generateVerificationOtp,
  hashOtp,
} from "@/modules/v1/verification/verification.utils";
import AppError from "@/utils/AppError";
import ERROR_CODE from "@/utils/ERROR_CODES";
import MESSAGES from "@/utils/MESSAGE";
import { status } from "http-status";
import mongoose from "mongoose";

const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

const verifyEmailOtp = async (
  payload: IVerifyOtpInput,
): Promise<IVerificationResponse> => {
  const normalizedEmail = normalizeEmail(payload.email);

  // 1. Find user by email
  const user = await User.findOne({ email: normalizedEmail }).exec();
  if (!user) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.USER_NOT_FOUND,
      MESSAGES.USER_NOT_FOUND,
    );
  }

  // 2. Find Verification document with OTP hash
  const verification = await Verification.findOne({ user: user._id })
    .select("+otp")
    .exec();

  if (!verification) {
    throw new AppError(
      status.NOT_FOUND,
      "VERIFICATION_NOT_FOUND",
      VERIFICATION_MESSAGES.RECORD_NOT_FOUND,
    );
  }

  // 3. Check if email is already verified
  if (verification.isEmailVerified) {
    throw new AppError(
      status.BAD_REQUEST,
      "AUTH_EMAIL_ALREADY_VERIFIED",
      VERIFICATION_MESSAGES.ALREADY_VERIFIED,
    );
  }

  // 4. Check maximum verification attempts
  if (verification.attempts >= config.OTP_MAX_ATTEMPTS) {
    throw new AppError(
      status.TOO_MANY_REQUESTS,
      ERROR_CODE.TOO_MANY_REQUESTS,
      VERIFICATION_MESSAGES.MAX_ATTEMPTS,
    );
  }

  // 5. Check if OTP exists and is not expired
  if (
    !verification.otp ||
    !verification.expiresAt ||
    verification.expiresAt.getTime() < Date.now()
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      ERROR_CODE.AUTH_OTP_EXPIRED,
      VERIFICATION_MESSAGES.OTP_EXPIRED,
    );
  }

  // 6. Compare submitted OTP against stored hash
  const isMatch = compareOtp(payload.otp, verification.otp);
  if (!isMatch) {
    // Atomically increment failed attempts
    await Verification.updateOne(
      { _id: verification._id, attempts: { $lt: config.OTP_MAX_ATTEMPTS } },
      { $inc: { attempts: 1 } },
    );

    throw new AppError(
      status.BAD_REQUEST,
      ERROR_CODE.AUTH_OTP_NOT_MATCH,
      VERIFICATION_MESSAGES.OTP_INVALID,
    );
  }

  // 7. Successful OTP verification: start MongoDB transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await Verification.findByIdAndUpdate(
      verification._id,
      {
        $set: {
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
          attempts: 0,
        },
        $unset: {
          otp: 1,
          expiresAt: 1,
        },
      },
      { session },
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }

  // 8. Clean up Redis cooldown and auth OTP keys
  await clearVerificationOtpCooldown(normalizedEmail);
  await deleteOtp(normalizedEmail);
  await deleteOtpAttempts(normalizedEmail);

  return {
    message: VERIFICATION_MESSAGES.EMAIL_VERIFIED,
  };
};

const resendVerificationOtp = async (
  payload: IResendOtpInput,
): Promise<IVerificationResponse> => {
  const normalizedEmail = normalizeEmail(payload.email);

  // 1. Find user by email
  const user = await User.findOne({ email: normalizedEmail }).exec();
  if (!user) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.USER_NOT_FOUND,
      MESSAGES.USER_NOT_FOUND,
    );
  }

  // 2. Check if email is already verified
  const existingVerification = await Verification.findOne({
    user: user._id,
  }).exec();

  if (existingVerification?.isEmailVerified) {
    throw new AppError(
      status.BAD_REQUEST,
      "AUTH_EMAIL_ALREADY_VERIFIED",
      VERIFICATION_MESSAGES.ALREADY_VERIFIED,
    );
  }

  // 3. Check 60-second cooldown in Redis
  const inCooldown = await isVerificationOtpInCooldown(normalizedEmail);
  if (inCooldown) {
    throw new AppError(
      status.TOO_MANY_REQUESTS,
      ERROR_CODE.TOO_MANY_REQUESTS,
      VERIFICATION_MESSAGES.RESEND_COOLDOWN,
    );
  }

  // 4. Generate new 5-digit numeric OTP and hash it
  const otp = generateVerificationOtp(config.OTP_LENGTH);
  const hashedOtp = hashOtp(otp);
  const expiresAt = new Date(Date.now() + config.OTP_EXPIRES_IN * 1000);

  // 5. Replace previous OTP hash and reset attempts atomically
  await Verification.findOneAndUpdate(
    { user: user._id },
    {
      otp: hashedOtp,
      expiresAt,
      attempts: 0,
    },
    { upsert: true, new: true },
  );

  // 6. Set 60-second cooldown in Redis
  await setVerificationOtpCooldown(normalizedEmail, config.OTP_RESEND_COOLDOWN);

  // 7. Send new OTP email via Auth Email Service
  emailService
    .sendVerificationEmail(normalizedEmail, user.name, otp)
    .catch(() => {});

  return {
    message: VERIFICATION_MESSAGES.OTP_RESENT,
  };
};

const verificationService = {
  verifyEmailOtp,
  resendVerificationOtp,
};

export default verificationService;
