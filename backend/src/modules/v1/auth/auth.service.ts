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
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

/**
 * Application Modules
 */
import config from "@/config";
import { transporter } from "@/lib/nodemailer";
import { redisClient } from "@/lib/redis";
import { logger } from "@/lib/winston";
import AppError from "@/utils/appError";
import { API_MESSAGES, ERROR_CODE } from "@/utils/constants";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@/utils/jwt";

/**
 * Application Models
 */
import Admin from "@/modules/v1/admin/admin.model";
import User from "@/modules/v1/auth/auth.model";
import Buyer from "@/modules/v1/buyer/buyer.model";
import Seller from "@/modules/v1/seller/seller.model";

/**
 * Types
 */
import type {
  AuthResponse,
  IForgotPasswordPayload,
  ILoginPayload,
  IRegisterPayload,
  IResetPasswordPaylod,
} from "@/modules/v1/auth/auth.interface";
import { UserRole } from "@/modules/v1/auth/auth.interface";
import type { Request, Response } from "express";

/**
 * Service for user registration
 * @param { IRegisterPayload } payload
 * @returns { Promise<AuthResponse> }
 */
const register = async (payload: IRegisterPayload): Promise<AuthResponse> => {
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
      StatusCodes.FORBIDDEN,
      ERROR_CODE.AUTHENTICATION_ERROR,
      API_MESSAGES.ADMIN_CANNOT_REGISTER,
    );
  }

  // Start Transaction
  const session = await mongoose.startSession();

  try {
    // Execute Transaction
    const user = await session.withTransaction(async () => {
      // Check existing user
      const existingUser = await User.findOne({
        email,
      }).session(session);

      if (existingUser) {
        logger.warn(API_MESSAGES.EMAIL_ALREADY_EXISTS, {
          email,
        });

        throw new AppError(
          StatusCodes.CONFLICT,
          ERROR_CODE.AUTH_EMAIL_EXISTS,
          API_MESSAGES.EMAIL_ALREADY_EXISTS,
        );
      }

      // Create User
      const [createdUser] = await User.create(
        [
          {
            fullName,
            email,
            password,
            role,
          },
        ],
        { session },
      );

      // Create Profile based on role
      if (role === UserRole.BUYER) {
        await Buyer.create(
          [
            {
              user: createdUser._id,
            },
          ],
          { session },
        );
      }

      if (role === UserRole.SELLER) {
        await Seller.create(
          [
            {
              user: createdUser._id,
            },
          ],
          { session },
        );
      }

      if (role === UserRole.ADMIN) {
        await Admin.create(
          [
            {
              user: createdUser._id,
            },
          ],
          { session },
        );
      }

      return createdUser;
    });

    // Ensure Transaction completed successfully
    if (!user) {
      logger.warn(
        role === UserRole.BUYER
          ? "Buyer profile creation failed"
          : role === UserRole.SELLER
            ? "Seller profile creation failed"
            : "Admin profile creation failed",
        { email },
      );

      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        ERROR_CODE.AUTHENTICATION_ERROR,
        role === UserRole.BUYER
          ? "Buyer profile creation failed"
          : role === UserRole.SELLER
            ? "Seller profile creation failed"
            : "Admin profile creation failed",
      );
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
  } catch (error: unknown) {
    // Handle duplicate email error from unique index
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      logger.warn(API_MESSAGES.EMAIL_ALREADY_EXISTS, {
        email,
      });

      throw new AppError(
        StatusCodes.CONFLICT,
        ERROR_CODE.AUTH_EMAIL_EXISTS,
        API_MESSAGES.EMAIL_ALREADY_EXISTS,
      );
    }

    // Throw error to asyncHandler and global error handler
    throw error;
  } finally {
    // End Transaction Session
    await session.endSession();
  }
};

/**
 * Service for user login
 * @param { ILoginRequest } payload
 * @returns { Promise<AuthResponse> }
 */
const login = async (payload: ILoginPayload): Promise<AuthResponse> => {
  // Destructure the all payload
  const { email, password } = payload;

  // Check existing user
  const existingUser = await User.findOne({
    email,
  });

  if (!existingUser) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
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
      StatusCodes.UNAUTHORIZED,
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
 * Service for user refresh token.
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
const refreshToken = async ({
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
      StatusCodes.UNAUTHORIZED,
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
      StatusCodes.NOT_FOUND,
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
 * Service for user forgot password
 * @param { string } payload
 * @returns { Promise<void> }
 */
const forgotPassword = async (
  payload: IForgotPasswordPayload,
): Promise<void> => {
  // Destructure the all payload
  const { email } = payload;

  // Check existing user
  const user = await User.findOne({
    email,
  });

  if (!user) {
    logger.warn(API_MESSAGES.ACCOUNT_NOT_FOUND, { email });

    throw new AppError(
      StatusCodes.NOT_FOUND,
      ERROR_CODE.AUTH_ACCOUNT_NOT_FOUND,
      API_MESSAGES.ACCOUNT_NOT_FOUND,
    );
  }

  // Generate OTP
  const otp = crypto.randomInt(100000, 1000000).toString();

  // Set OTP in Redis
  const key = `forgot-password-otp:${user.email}`;

  const expirationSeconds = 5 * 60;

  // Set OTP in Redis
  await redisClient.set(key, otp, {
    expiration: {
      type: "EX",
      value: expirationSeconds,
    },
  });

  // Get the forgot password template path
  const templatePath = path.join(
    process.cwd(),
    "src/templates/forgot-password.ejs",
  );

  // Render the forgot password template
  const html = await ejs.renderFile(templatePath, {
    name: user.fullName,
    otp,
    expiresIn: expirationSeconds / 60,
  });

  // Send OTP to user's email
  await transporter.sendMail({
    from: config.EMAIL_SENDER,
    to: user.email,
    subject: "Reset Your Jus-Buy Password",
    html,
  });
};

/**
 * Service for user reset password
 * @param payload { IResetPasswordPaylod }
 * @returns { Promise<void> }
 */
const resetPassword = async (payload: IResetPasswordPaylod): Promise<void> => {
  // Destructure the all payload
  const { otp, newPassword, email } = payload;

  const user = await User.findOne({
    email,
  });

  // Check user exist or not
  if (!user) {
    logger.warn(API_MESSAGES.ACCOUNT_NOT_FOUND, { email });

    throw new AppError(
      StatusCodes.NOT_FOUND,
      ERROR_CODE.AUTH_ACCOUNT_NOT_FOUND,
      API_MESSAGES.ACCOUNT_NOT_FOUND,
    );
  }

  // Check OTP
  const key = `forgot-password-otp:${user.email}`;

  // Get OTP from Redis
  const redisOtp = await redisClient.get(key);

  // Check OTP expired or not
  if (!redisOtp) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      ERROR_CODE.AUTH_OTP_EXPIRED,
      API_MESSAGES.OTP_EXPIRED,
    );
  }

  // Check OTP match or not
  if (String(redisOtp).trim() !== String(otp).trim()) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
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
};

/**
 * Auth service instance
 */
const authService = {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
};

/**
 * Export auth service
 */
export default authService;
