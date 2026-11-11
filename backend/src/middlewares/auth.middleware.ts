import {
  AccountStatus,
  UserRole,
  type TAccountStatus,
  type TUserRole,
} from "@/modules/v1/user/user.constant";
import User from "@/modules/v1/user/user.model";
import { VendorStatus } from "@/modules/v1/vendor/vendor.constant";
import Vendor from "@/modules/v1/vendor/vendor.model";
import type { IVerification } from "@/modules/v1/verification/verification.interface";
import AppError from "@/utils/AppError";
import ERROR_CODE from "@/utils/ERROR_CODES";
import MESSAGES from "@/utils/MESSAGE";
import asyncHandler from "@/utils/asyncHandler";
import { verifyAccessToken, type IJwtPayload } from "@/utils/jwt";
import type { NextFunction, Request, Response } from "express";
import { status } from "http-status";
import type { Types } from "mongoose";

export interface IAuthUser {
  userId: string;
  _id: Types.ObjectId;
  role: TUserRole;
  email: string;
  name: string;
  status: TAccountStatus;
}

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    // 1. Read the Access Token from Authorization header or cookie
    let token = req.cookies?.accessToken;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      throw new AppError(
        status.UNAUTHORIZED,
        ERROR_CODE.AUTH_TOKEN_MISSING,
        MESSAGES.TOKEN_MISSING,
      );
    }

    // 2. Verify JWT signature and expiration
    let decoded: IJwtPayload;
    try {
      decoded = verifyAccessToken(token);
    } catch (error: any) {
      if (error?.name === "TokenExpiredError") {
        throw new AppError(
          status.UNAUTHORIZED,
          ERROR_CODE.AUTH_TOKEN_EXPIRED,
          MESSAGES.TOKEN_EXPIRED,
        );
      }
      throw new AppError(
        status.UNAUTHORIZED,
        ERROR_CODE.AUTH_TOKEN_INVALID,
        MESSAGES.TOKEN_INVALID,
      );
    }

    // 3. Retrieve the current user from database
    const user = await User.findById(decoded.userId)
      .populate<{ verification: IVerification }>("verification")
      .exec();

    if (!user) {
      throw new AppError(
        status.UNAUTHORIZED,
        ERROR_CODE.USER_NOT_FOUND,
        MESSAGES.USER_NOT_FOUND,
      );
    }

    // 4. Verify account status
    if (user.status === AccountStatus.BLOCKED) {
      throw new AppError(
        status.FORBIDDEN,
        ERROR_CODE.AUTH_ACCOUNT_DISABLED,
        MESSAGES.ACCOUNT_DISABLED,
      );
    }

    // 5. Verify email verification
    if (!user.verification?.isEmailVerified) {
      throw new AppError(
        status.FORBIDDEN,
        ERROR_CODE.FORBIDDEN,
        "Please verify your email address to access this resource.",
      );
    }

    // 6. Attach properly typed authenticated user information to request
    req.user = {
      userId: user._id.toString(),
      _id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
      status: user.status,
    };

    next();
  },
);

export const authorize = (...roles: TUserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(
        status.UNAUTHORIZED,
        ERROR_CODE.UNAUTHORIZED,
        MESSAGES.UNAUTHORIZED,
      );
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(
        status.FORBIDDEN,
        ERROR_CODE.FORBIDDEN,
        MESSAGES.FORBIDDEN,
      );
    }

    next();
  };
};

export const requireApprovedVendor = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AppError(
        status.UNAUTHORIZED,
        ERROR_CODE.UNAUTHORIZED,
        MESSAGES.UNAUTHORIZED,
      );
    }

    if (req.user.role !== UserRole.VENDOR) {
      throw new AppError(
        status.FORBIDDEN,
        ERROR_CODE.FORBIDDEN,
        MESSAGES.FORBIDDEN,
      );
    }

    const vendor = await Vendor.findOne({ vendor: req.user._id }).exec();

    if (!vendor) {
      throw new AppError(
        status.NOT_FOUND,
        ERROR_CODE.SELLER_PROFILE_NOT_FOUND,
        MESSAGES.SELLER_PROFILE_NOT_FOUND,
      );
    }

    if (vendor.status !== VendorStatus.APPROVED) {
      throw new AppError(
        status.FORBIDDEN,
        ERROR_CODE.SELLER_NOT_APPROVED,
        MESSAGES.SELLER_CANNOT_CREATE_PRODUCT,
      );
    }

    req.vendor = vendor;
    next();
  },
);

export default authenticate;
