import { getClientIp } from "@/middlewares/rate-limiter.middleware";
import Buyer from "@/modules/v1/buyer/buyer.model";
import authService from "@/modules/v1/auth/auth.service";
import AppError from "@/utils/AppError";
import ERROR_CODE from "@/utils/ERROR_CODES";
import MESSAGES from "@/utils/MESSAGE";
import asyncHandler from "@/utils/asyncHandler";
import { clearAuthCookies, setAuthCookies } from "@/utils/cookie";
import sendResponse from "@/utils/sendResponse";
import type { Request, Response } from "express";
import { status } from "http-status";

const register = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await authService.register(req.body);

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: result.message,
      data: result.user,
    });
  },
);

const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const clientIp = getClientIp(req);
    const result = await authService.login(req.body, clientIp);

    setAuthCookies(res, result.accessToken, result.refreshToken);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: MESSAGES.LOGIN_SUCCESS,
      data: {
        user: result.user,
        redirectUrl: result.redirectUrl,
      },
    });
  },
);

const logout = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;

    if (userId) {
      await authService.logout(userId).catch(() => {});
    }
    clearAuthCookies(res);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: MESSAGES.LOGOUT_SUCCESS,
    });
  },
);

const getMe = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user;

    if (!authUser) {
      throw new AppError(
        status.UNAUTHORIZED,
        ERROR_CODE.UNAUTHORIZED,
        MESSAGES.UNAUTHORIZED,
      );
    }

    let avatar = "";
    try {
      const buyerProfile = await Buyer.findOne({ buyer: authUser._id })
        .select("profile")
        .lean()
        .exec();
      if (buyerProfile?.profile?.url) {
        avatar = buyerProfile.profile.url;
      }
    } catch {
      // Non-critical if profile document does not exist yet
    }

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Current user retrieved successfully",
      data: {
        id: authUser.userId,
        name: authUser.name,
        email: authUser.email,
        role: authUser.role,
        isEmailVerified: true,
        avatar,
      },
    });
  },
);

const refreshToken = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      throw new AppError(
        status.UNAUTHORIZED,
        ERROR_CODE.AUTH_REFRESH_TOKEN_MISSING,
        MESSAGES.REFRESH_TOKEN_MISSING,
      );
    }

    const result = await authService.refreshToken(token);
    setAuthCookies(res, result.accessToken, result.refreshToken);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: MESSAGES.TOKEN_REFRESH_SUCCESS,
    });
  },
);

const forgotPassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await authService.forgotPassword(req.body);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: result.message,
    });
  },
);

const resetPassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await authService.resetPassword(req.body);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: result.message,
    });
  },
);

const authController = {
  register,
  login,
  logout,
  getMe,
  refreshToken,
  forgotPassword,
  resetPassword,
};

export default authController;
