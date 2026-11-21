import ERROR_CODE from "@/utils/ERROR_CODES";
import MESSAGES from "@/utils/MESSAGE";
import type { NextFunction, Request, Response } from "express";
import { status } from "http-status";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import multer from "multer";
import { ZodError } from "zod";

const globalErrorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (error instanceof TokenExpiredError) {
    res.status(status.UNAUTHORIZED).json({
      success: false,
      code: ERROR_CODE.AUTH_TOKEN_EXPIRED,
      message: MESSAGES.TOKEN_EXPIRED,
    });

    return;
  }

  if (error instanceof JsonWebTokenError) {
    res.status(status.UNAUTHORIZED).json({
      success: false,
      code: ERROR_CODE.AUTH_TOKEN_INVALID,
      message: MESSAGES.TOKEN_INVALID,
    });

    return;
  }

  if (error instanceof ZodError) {
    const errors = error.issues.map((issue) => ({
      field: issue.path.length > 0 ? issue.path.join(".") : "unknown",
      message: issue.message,
    }));

    res.status(status.BAD_REQUEST).json({
      success: false,
      code: ERROR_CODE.VALIDATION_ERROR,
      message: MESSAGES.VALIDATION_ERROR,
      errors,
    });

    return;
  }

  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "File size exceeds 5 MB limit."
        : error.message;

    res.status(status.BAD_REQUEST).json({
      success: false,
      code: ERROR_CODE.VALIDATION_ERROR,
      message,
    });

    return;
  }

  const err = error as {
    statusCode?: number;
    status?: number;
    code?: string;
    message?: string;
    stack?: string;
  };

  const statusCode =
    err.statusCode ?? err.status ?? status.INTERNAL_SERVER_ERROR;

  const message = err.message ?? MESSAGES.INTERNAL_SERVER_ERROR;

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
