/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Thired-Party Module
 */
import { StatusCodes } from "http-status-codes";

/**
 * Application Modules
 */
import config from "@/config";
import { logger } from "@/lib/winston";
import asyncHandler from "@/utils/asyncHandler";
import { API_MESSAGES } from "@/utils/constants";
import sendResponse from "@/utils/sendResponse";

/**
 * Application Service
 */
import authService from "@/modules/v1/auth/auth.service";

/**
 * Type
 */
import { UserRole } from "@/modules/v1/auth/auth.interface";
import type { Request, Response } from "express";

/**
 * Controller for user registration
 */
const register = asyncHandler(async (req: Request, res: Response) => {
  // Call user registration service
  const result = await authService.register(req.body);

  // Log the user signup
  if (result) {
    logger.info(
      result.user.role === UserRole.SELLER
        ? API_MESSAGES.SELLER_PROFILE_CREATED
        : result.user.role === UserRole.BUYER
          ? API_MESSAGES.BUYER_PROFILE_CREATED
          : API_MESSAGES.ADMIN_PROFILE_CREATED,
      {
        user: {
          fullName: result.user.fullName,
          email: result.user.email,
          role: result.user.role,
        },
      },
    );
  }

  // Set access token in cookie
  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: config.NODE_ENV !== "development",
    sameSite: config.NODE_ENV === "development" ? "lax" : "strict",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  // Set refresh token in cookie
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV !== "development",
    sameSite: config.NODE_ENV === "development" ? "lax" : "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  // Get the message based on user role
  const message =
    result.user.role === "seller"
      ? API_MESSAGES.SELLER_PROFILE_CREATED
      : result.user.role === "buyer"
        ? API_MESSAGES.BUYER_PROFILE_CREATED
        : API_MESSAGES.ADMIN_PROFILE_CREATED;

  // Send response
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message,
    data: {
      user: {
        fullName: result.user.fullName,
        email: result.user.email,
        role: result.user.role,
      },
    },
  });
});

/**
 * Controller for user login
 */
const login = asyncHandler(async (req: Request, res: Response) => {
  // Call user login service
  const result = await authService.login(req.body);

  // Log the user signup
  if (result) {
    logger.info(
      result.user.role === UserRole.SELLER
        ? API_MESSAGES.SELLER_LOGIN_SUCCESS
        : result.user.role === UserRole.BUYER
          ? API_MESSAGES.BUYER_LOGIN_SUCCESS
          : API_MESSAGES.ADMIN_LOGIN_SUCCESS,
      {
        user: {
          fullName: result.user.fullName,
          email: result.user.email,
          role: result.user.role,
        },
      },
    );
  }

  // Set access token in cookie
  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: config.NODE_ENV !== "development",
    sameSite: config.NODE_ENV === "development" ? "lax" : "strict",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  // Set refresh token in cookie
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV !== "development",
    sameSite: config.NODE_ENV === "development" ? "lax" : "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  // Get the message based on user role
  const message =
    result.user.role === "seller"
      ? API_MESSAGES.SELLER_LOGIN_SUCCESS
      : result.user.role === "buyer"
        ? API_MESSAGES.BUYER_LOGIN_SUCCESS
        : API_MESSAGES.ADMIN_LOGIN_SUCCESS;

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message,
    data: {
      user: {
        fullName: result.user.fullName,
        email: result.user.email,
        role: result.user.role,
      },
    },
  });
});

/**
 * Controller for user refresh token
 */
const refreshToken = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    // Call user refresh token service
    await authService.refreshToken({ req, res });

    // Log the token refreshed
    logger.info(API_MESSAGES.TOKEN_REFRESH_SUCCESS);

    // Send response
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: API_MESSAGES.TOKEN_REFRESH_SUCCESS,
    });
  },
);

/**
 * Controller for user logout
 */
const logout = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    // Clear access token cookie
    res.clearCookie("accessToken");

    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    // Log the user logout
    logger.info(API_MESSAGES.LOGOUT_SUCCESS);

    // Send response
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: API_MESSAGES.LOGOUT_SUCCESS,
    });
  },
);

/**
 * Controller for user forgot password
 */
const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  // Call forgot password service
  await authService.forgotPassword(req.body);

  // Log the forgot password
  logger.info(API_MESSAGES.PASSWORD_RESET_OTP_SENT);

  // Send response
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: API_MESSAGES.PASSWORD_RESET_OTP_SENT,
  });
});

/**
 * Controller for user reset password
 */
const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  // Call reset password service
  await authService.resetPassword(req.body);

  // Log the forgot password
  logger.info(API_MESSAGES.PASSWORD_RESET_SUCCESS);

  // Send response
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: API_MESSAGES.PASSWORD_RESET_SUCCESS,
  });
});

/**
 * Auth controller instance
 */
const authController = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
};

/**
 * Export auth controller
 */
export default authController;
