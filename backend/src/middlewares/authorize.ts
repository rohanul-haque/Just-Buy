/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Application Modules
 */
import User from "@/modules/v1/auth/auth.model";
import AppError from "@/utils/appError";
import asyncHandler from "@/utils/asyncHandler";
import { API_MESSAGES, ERROR_CODE, HTTP_STATUS } from "@/utils/constants";

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
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODE.USER_NOT_FOUND,
          "User not found",
        );
      }

      // Check if user has required role
      if (!roles.includes(user.role)) {
        throw new AppError(
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODE.AUTHENTICATION_ERROR,
          API_MESSAGES.FORBIDDEN,
        );
      }

      next();
    },
  );
};

export default authorize;
