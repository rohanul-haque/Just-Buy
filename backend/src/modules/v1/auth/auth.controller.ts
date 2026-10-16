/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Application Modules
 */
import config from "@/config";
import { logger } from "@/lib/winston";
import asyncHandler from "@/utils/asyncHandler";
import { API_MESSAGES, HTTP_STATUS } from "@/utils/constants";
import sendResponse from "@/utils/sendResponse";

/**
 * Services
 */
import {
  forgotPasswordService,
  loginService,
  refreshTokenService,
  registerService,
  resetPasswordService,
} from "@/modules/v1/auth/auth.service";

/**
 * Type
 */
import type { Request, Response } from "express";

/**
 * Controller for user registration
 */
export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    // Call user registration service
    const result = await registerService(req.body);

    // Log the user signup
    logger.info("User Signup Successfully", {
      user: {
        fullName: result.user.fullName,
        email: result.user.email,
        role: result.user.role,
      },
    });

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
      statusCode: HTTP_STATUS.CREATED,
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
  },
);

/**
 * Controller for user login
 */
export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    // Call user login service
    const result = await loginService(req.body);

    // Log the user login
    logger.info("User Login Successfully", {
      user: {
        fullName: result.user.fullName,
        email: result.user.email,
        role: result.user.role,
      },
    });

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
          : API_MESSAGES.ADMIN_PROFILE_CREATED;

    sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
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
  },
);

/**
 * Controller for user logout
 */
export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    // Clear access token cookie
    res.clearCookie("accessToken");

    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    // Log the user logout
    logger.info("User Logout Successfully");

    // Send response
    sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: API_MESSAGES.LOGOUT_SUCCESS,
    });
  },
);

/**
 * Controller for user refresh token
 */
export const refreshTokenController = asyncHandler(
  async (req: Request, res: Response) => {
    // Call user refresh token service
    await refreshTokenService({ req, res });

    // Log the user refresh token
    logger.info("User Refresh Token Successfully");

    // Send response
    sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: API_MESSAGES.TOKEN_REFRESH_SUCCESS,
    });
  },
);

/**
 * Forgot Password Controller
 * @param {Request} req
 * @param {Response} res
 */
export const forgotPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body;
    await forgotPasswordService(body);

    // Send response
    sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: API_MESSAGES.PASSWORD_RESET_OTP_SENT,
    });
  },
);

/**
 * Reset Password Controller
 * @param {Request} req
 * @param {Response} res
 */
export const resetPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body;
    await resetPasswordService(body);

    // Send response
    sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: API_MESSAGES.PASSWORD_RESET_SUCCESS,
    });
  },
);
