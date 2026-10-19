/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Node.js Module
 */
import path from "path";

/**
 * Third-Party Modules
 */
import bcrypt from "bcrypt";
import crypto from "crypto";
import ejs from "ejs";

/**
 * Application Modules
 */
import config from "@/config";
import { transporter } from "@/lib/nodemailer";
import { redisClient } from "@/lib/redis";
import { logger } from "@/lib/winston";
import AppError from "@/utils/appError";
import { API_MESSAGES, ERROR_CODE, HTTP_STATUS } from "@/utils/constants";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@/utils/jwt";

/**
 * Models
 */
import Admin from "@/modules/v1/admin/admin.model";
import User from "@/modules/v1/auth/auth.model";
import Buyer from "@/modules/v1/buyer/buyer.model";
import Seller from "@/modules/v1/seller/seller.model";

/**
 * Types
 */
import {
  IResetPasswordRequest,
  UserRole,
  type AuthResponse,
  type IForgotPasswordRequest,
  type ILoginRequest,
  type IRegisterRequest,
} from "@/modules/v1/auth/auth.intarface";
import type { Request, Response } from "express";

/**
 * User Register Service
 * @param { IRegisterRequest } payload
 * @returns { Promise<AuthResponse> }
 */
export const registerService = async (
  payload: IRegisterRequest,
): Promise<AuthResponse> => {
  // Destructure the all payload
  const { fullName, email, password, role } = payload;

  // Check if user is trying to sign as an admin with non-whitelisted email
  if (
    role === UserRole.ADMIN &&
    !config.WHITELISTED_ADMIN_MAILS.includes(email)
  ) {
    logger.warn(
      "You cannot sign as an admin. your email not admin whitelisted",
      { email },
    );

    throw new AppError(
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODE.AUTHENTICATION_ERROR,
      API_MESSAGES.ADMIN_CANNOT_REGISTER,
    );
  }

  // Check existing user
  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      ERROR_CODE.AUTH_EMAIL_EXISTS,
      API_MESSAGES.EMAIL_ALREADY_EXISTS,
    );
  }

  // Create User
  const user = await User.create({
    fullName,
    email,
    password,
    role,
    isActive: true,
  });

  // Create Profile based on role
  if (role === UserRole.BUYER) {
    await Buyer.create({
      user: user?._id,
    });
  }

  if (role === UserRole.SELLER) {
    await Seller.create({
      user: user?._id,
    });
  }

  if (role === UserRole.ADMIN) {
    await Admin.create({
      user: user?._id,
    });
  }

  // Create Token
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Return the user, access & and refresh token
  return {
    user: {
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * User Login Service
 * @param { ILoginRequest } payload
 * @returns { Promise<AuthResponse> }
 */
export const loginService = async (
  payload: ILoginRequest,
): Promise<AuthResponse> => {
  // Destructure the all payload
  const { email, password } = payload;

  // Check existing user
  const existingUser = await User.findOne({
    email,
  });

  if (!existingUser) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.AUTH_ACCOUNT_NOT_FOUND,
      API_MESSAGES.ACCOUNT_NOT_FOUND,
    );
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(
    password,
    existingUser?.password,
  );

  if (!isPasswordValid) {
    throw new AppError(
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODE.AUTH_INVALID_CREDENTIALS,
      API_MESSAGES.INVALID_CREDENTIALS,
    );
  }

  // Create Token
  const accessToken = generateAccessToken(existingUser._id);
  const refreshToken = generateRefreshToken(existingUser._id);

  // Return the user, access & and refresh token
  return {
    user: {
      fullName: existingUser.fullName,
      email: existingUser.email,
      role: existingUser.role,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Service for refresh token.
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export const refreshTokenService = async ({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<void> => {
  // Get refresh token from cookies
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError(
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODE.AUTH_REFRESH_TOKEN_MISSING,
      API_MESSAGES.REFRESH_TOKEN_MISSING,
    );
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);

  // Check user exist or not
  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.AUTH_ACCOUNT_NOT_FOUND,
      API_MESSAGES.ACCOUNT_NOT_FOUND,
    );
  }

  // Generate new access token
  const accessToken = generateAccessToken(user?._id);

  // Set access token in cookies
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: config.NODE_ENV !== "development",
    sameSite: config.NODE_ENV === "development" ? "lax" : "strict",
    maxAge: 60 * 60 * 1000, // 1 hour
  });
};

/**
 * Forgot Password Service
 * @param { string } payload
 * @returns { Promise<AuthResponse> }
 */
export const forgotPasswordService = async (
  payload: IForgotPasswordRequest,
): Promise<void> => {
  const email = payload.email.trim().toLowerCase();

  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.AUTH_ACCOUNT_NOT_FOUND,
      API_MESSAGES.ACCOUNT_NOT_FOUND,
    );
  }

  if (user.isActive === false) {
    throw new AppError(
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODE.AUTH_ACCOUNT_DISABLED,
      API_MESSAGES.ACCOUNT_DISABLED,
    );
  }

  const otp = crypto.randomInt(100000, 1000000).toString();

  const key = `forgot-password-otp:${user.email}`;

  const expirationSeconds = 5 * 60;

  await redisClient.set(key, otp, {
    expiration: {
      type: "EX",
      value: expirationSeconds,
    },
  });

  const templatePath = path.join(
    process.cwd(),
    "src/templates/forgot-password.ejs",
  );

  const html = await ejs.renderFile(templatePath, {
    name: user.fullName,
    otp,
    expiresIn: expirationSeconds / 60,
  });

  await transporter.sendMail({
    from: config.EMAIL_SENDER,
    to: user.email,
    subject: "Reset Your Just-Buy Password",
    html,
  });
};

export const resetPasswordService = async (
  payload: IResetPasswordRequest,
): Promise<void> => {
  // Destructure the all payload
  const { otp, newPassword } = payload;
  const email = payload.email.trim().toLowerCase();

  const user = await User.findOne({
    email,
  });

  // Check user exist or not
  if (!user) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.AUTH_ACCOUNT_NOT_FOUND,
      API_MESSAGES.ACCOUNT_NOT_FOUND,
    );
  }

  // Check user is active or not
  if (user.isActive === false) {
    throw new AppError(
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODE.AUTH_ACCOUNT_DISABLED,
      API_MESSAGES.ACCOUNT_DISABLED,
    );
  }

  // Check OTP
  const key = `forgot-password-otp:${user.email}`;

  // Get OTP from Redis
  const redisOtp = await redisClient.get(key);

  // Check OTP expired or not
  if (!redisOtp) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODE.AUTH_OTP_EXPIRED,
      API_MESSAGES.OTP_EXPIRED,
    );
  }

  // Check OTP match or not
  if (String(redisOtp).trim() !== String(otp).trim()) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODE.AUTH_OTP_NOT_MATCH,
      API_MESSAGES.OTP_NOT_MATCH,
    );
  }

  // Delete OTP from Redis
  await redisClient.del(key);

  // Update the user's password
  user.password = String(newPassword);

  // Save the user
  await user.save();

  logger.info("Password reset successfully", { email });
};
