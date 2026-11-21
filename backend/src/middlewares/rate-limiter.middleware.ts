import AuthRedisService from "@/modules/v1/auth/redis/redis.service";
import AppError from "@/utils/AppError";
import ERROR_CODE from "@/utils/ERROR_CODES";
import type { NextFunction, Request, Response } from "express";
import { status } from "http-status";

export const getClientIp = (req: Request): string => {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string") {
    return forwardedFor.split(",")[0].trim();
  }
  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "127.0.0.1";
};

export const registrationRateLimiter = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const ip = getClientIp(req);
    const result = await AuthRedisService.checkAndIncrementRegistrationRate(ip);

    if (!result.allowed) {
      throw new AppError(
        status.TOO_MANY_REQUESTS,
        ERROR_CODE.TOO_MANY_REQUESTS,
        `Too many registration requests from this IP. Please try again after ${Math.ceil((result.retryAfter || 900) / 60)} minutes.`,
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const loginRateLimiter = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const ip = getClientIp(req);
    const email =
      typeof req.body?.email === "string" ? req.body.email.trim() : "";

    const lockStatus = await AuthRedisService.isLoginLocked(ip, email);

    if (lockStatus.locked) {
      const waitMinutes = Math.ceil((lockStatus.retryAfter || 900) / 60);
      throw new AppError(
        status.TOO_MANY_REQUESTS,
        ERROR_CODE.TOO_MANY_REQUESTS,
        `Too many failed login attempts. Please try again in ${waitMinutes} minute(s).`,
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const verificationSendRateLimiter = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const ip = getClientIp(req);
    const result =
      await AuthRedisService.checkAndIncrementVerificationSendRate(ip);

    if (!result.allowed) {
      throw new AppError(
        status.TOO_MANY_REQUESTS,
        ERROR_CODE.TOO_MANY_REQUESTS,
        `Too many OTP requests from this IP. Please try again after ${Math.ceil((result.retryAfter || 900) / 60)} minutes.`,
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const verificationVerifyRateLimiter = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const ip = getClientIp(req);
    const result =
      await AuthRedisService.checkAndIncrementVerificationVerifyRate(ip);

    if (!result.allowed) {
      throw new AppError(
        status.TOO_MANY_REQUESTS,
        ERROR_CODE.TOO_MANY_REQUESTS,
        `Too many verification attempts from this IP. Please try again after ${Math.ceil((result.retryAfter || 900) / 60)} minutes.`,
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
