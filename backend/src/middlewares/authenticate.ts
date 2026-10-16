/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Application Modules
 */
import { logger } from "@/lib/winston";
import AppError from "@/utils/appError";
import asyncHandler from "@/utils/asyncHandler";
import { ERROR_CODE, HTTP_STATUS } from "@/utils/constants";
import { verifyAccessToken } from "@/utils/jwt";

/**
 * Types
 */
import type { NextFunction, Request, Response } from "express";
import type { Types } from "mongoose";

/**
 * Authentication Middleware Function
 * @param req - Request object
 * @param res - Response object
 * @param next - Next function
 * @returns {Promise<void>}
 */
const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    // Get access token from cookie
    const token = req.cookies.accessToken;

    // Throw error if no token is provided
    if (!token) {
      logger.error("Access denied, no token provided");

      throw new AppError(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODE.AUTHENTICATION_ERROR,
        "Access denied, no token provided",
      );
    }

    // Verify access token
    const jwtPayload = verifyAccessToken(token) as { userId: Types.ObjectId };

    // Set user ID in request
    req.userId = jwtPayload.userId;

    // Move to next middleware
    next();
  },
);

export default authenticate;
