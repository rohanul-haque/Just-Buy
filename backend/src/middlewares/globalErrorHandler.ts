/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Module
 */
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ZodError } from "zod";

/**
 * Application Modules
 */
import { API_MESSAGES, ERROR_CODE, HTTP_STATUS } from "@/utils/constants";

/**
 * Type
 */
import type { NextFunction, Request, Response } from "express";

/**
 * Global Error Handler Middleware
 *
 * @param error - The error to handle
 * @param _req - The request object
 * @param res - The response object
 * @param _next - The next function
 */
const globalErrorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  /**
   * JWT Expired Token Error
   */
  if (error instanceof TokenExpiredError) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      code: ERROR_CODE.AUTH_TOKEN_EXPIRED,
      message: API_MESSAGES.TOKEN_EXPIRED,
    });

    return;
  }

  /**
   * JWT Invalid Token Error
   */
  if (error instanceof JsonWebTokenError) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      code: ERROR_CODE.AUTH_TOKEN_INVALID,
      message: API_MESSAGES.TOKEN_INVALID,
    });

    return;
  }

  /**
   * Zod Validation Error
   */
  if (error instanceof ZodError) {
    const errors = error.issues.map((issue) => ({
      field: issue.path.length > 0 ? issue.path.join(".") : "unknown",
      message: issue.message,
    }));

    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      code: ERROR_CODE.VALIDATION_ERROR,
      message: API_MESSAGES.VALIDATION_ERROR,
      errors,
    });

    return;
  }

  /**
   * Custom Error
   */
  const err = error as {
    statusCode?: number;
    status?: number;
    code?: string;
    message?: string;
    stack?: string;
  };

  /**
   * Set Status Code
   */
  const statusCode =
    err.statusCode ?? err.status ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;

  /**
   * Set Error Message
   */
  const message = err.message ?? API_MESSAGES.INTERNAL_SERVER_ERROR;

  /**
   * Send Error Response
   */
  res.status(statusCode).json({
    success: false,
    code: err.code ?? ERROR_CODE.INTERNAL_SERVER_ERROR,
    message,
    ...(process.env.NODE_ENV !== "production" && {
      stack: err.stack,
    }),
  });
};

export default globalErrorHandler;
