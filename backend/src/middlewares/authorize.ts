/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Thired-Party Modules
 */
import { StatusCodes } from "http-status-codes";

/**
 * Application Modules
 */
import AppError from "@/utils/appError";
import asyncHandler from "@/utils/asyncHandler";
import { API_MESSAGES, ERROR_CODE } from "@/utils/constants";

/**
 * Application Model
 */
import User from "@/modules/v1/auth/auth.model";

/**
 * Types
 */
import { UserRole } from "@/modules/v1/auth/auth.intarface";
import type { NextFunction, Request, Response } from "express";

/**
 * Role Check Middleware
 * @param roles - Array of roles that are allowed to access the resource
 * @returns - Middleware function
 */
const authorize = (roles: UserRole[]) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await User.findById(req.userId).select("role").exec();

      // Check if user exists
      if (!user) {
        throw new AppError(
          StatusCodes.NOT_FOUND,
          ERROR_CODE.USER_NOT_FOUND,
          "User not found",
        );
      }

      // Check if user has required role
      if (!roles.includes(user.role)) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          ERROR_CODE.AUTHENTICATION_ERROR,
          API_MESSAGES.FORBIDDEN,
        );
      }

      next();
    },
  );
};

/**
 * Export default authorize
 */
export default authorize;
