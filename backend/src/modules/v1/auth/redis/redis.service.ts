import config from "@/config";
import { redisClient } from "@/lib/redis";
import { logger } from "@/lib/winston";
import type {
  ILoginLockStatus,
  IRegistrationRateStatus,
} from "@/modules/v1/auth/redis/redis.interface";

const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

const isConnected = (): boolean => {
  return redisClient.isOpen;
};

// OTP Keys
const otpKey = (email: string): string => {
  return `auth:otp:${normalizeEmail(email)}`;
};

const otpAttemptsKey = (email: string): string => {
  return `auth:otp-attempts:${normalizeEmail(email)}`;
};

const otpCooldownKey = (email: string): string => {
  return `auth:otp-cooldown:${normalizeEmail(email)}`;
};

// Login Attempt and Cooldown Keys
const loginAttemptsIpKey = (ip: string): string => {
  return `auth:login-attempts:ip:${ip}`;
};

const loginAttemptsEmailKey = (email: string): string => {
  return `auth:login-attempts:email:${normalizeEmail(email)}`;
};

const loginCooldownIpKey = (ip: string): string => {
  return `auth:login-cooldown:ip:${ip}`;
};

const loginCooldownEmailKey = (email: string): string => {
  return `auth:login-cooldown:email:${normalizeEmail(email)}`;
};

// Password Reset Keys
const passwordResetKey = (userId: string): string => {
  return `auth:password-reset:${userId}`;
};

const passwordResetTokenMappingKey = (hashedToken: string): string => {
  return `auth:password-reset-token:${hashedToken}`;
};

// Refresh Token Session Key
const refreshTokenKey = (userId: string): string => {
  return `auth:refresh-token:${userId}`;
};

// Registration Rate Limiting Key
const registerRateKey = (ip: string): string => {
  return `auth:register-rate:ip:${ip}`;
};

// Verification Rate Limiting & Cooldown Keys
const verificationOtpCooldownKey = (email: string): string => {
  return `verification:otp-cooldown:${normalizeEmail(email)}`;
};

const verificationSendAttemptsIpKey = (ip: string): string => {
  return `verification:send-attempts:ip:${ip}`;
};

const verificationVerifyAttemptsIpKey = (ip: string): string => {
  return `verification:verify-attempts:ip:${ip}`;
};

/* ==========================================================================
   OTP Operations
   ========================================================================== */

export const storeOtp = async (
  email: string,
  hashedOtp: string,
  ttlSeconds = config.OTP_EXPIRES_IN,
): Promise<void> => {
  if (!isConnected()) {
    logger.warn("Redis client is not connected; skipping storeOtp");
    return;
  }
  try {
    const key = otpKey(email);
    await redisClient.set(key, hashedOtp, { EX: ttlSeconds });
  } catch (error) {
    logger.error("Redis storeOtp error:", error);
  }
};

export const getOtp = async (email: string): Promise<string | null> => {
  if (!isConnected()) {
    logger.warn("Redis client is not connected; skipping getOtp");
    return null;
  }
  try {
    const key = otpKey(email);
    return await redisClient.get(key);
  } catch (error) {
    logger.error("Redis getOtp error:", error);
    return null;
  }
};

export const deleteOtp = async (email: string): Promise<void> => {
  if (!isConnected()) return;
  try {
    const key = otpKey(email);
    await redisClient.del(key);
  } catch (error) {
    logger.error("Redis deleteOtp error:", error);
  }
};

export const getOtpAttempts = async (email: string): Promise<number> => {
  if (!isConnected()) return 0;
  try {
    const key = otpAttemptsKey(email);
    const count = await redisClient.get(key);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    logger.error("Redis getOtpAttempts error:", error);
    return 0;
  }
};

export const incrementOtpAttempts = async (
  email: string,
  ttlSeconds = config.OTP_EXPIRES_IN,
): Promise<number> => {
  if (!isConnected()) return 0;
  try {
    const key = otpAttemptsKey(email);
    const attempts = await redisClient.incr(key);
    if (attempts === 1) {
      await redisClient.expire(key, ttlSeconds);
    }
    return attempts;
  } catch (error) {
    logger.error("Redis incrementOtpAttempts error:", error);
    return 0;
  }
};

export const deleteOtpAttempts = async (email: string): Promise<void> => {
  if (!isConnected()) return;
  try {
    const key = otpAttemptsKey(email);
    await redisClient.del(key);
  } catch (error) {
    logger.error("Redis deleteOtpAttempts error:", error);
  }
};

export const setOtpCooldown = async (
  email: string,
  seconds = config.OTP_RESEND_COOLDOWN,
): Promise<void> => {
  if (!isConnected()) return;
  try {
    const key = otpCooldownKey(email);
    await redisClient.set(key, "1", { EX: seconds });
  } catch (error) {
    logger.error("Redis setOtpCooldown error:", error);
  }
};

export const isOtpInCooldown = async (email: string): Promise<boolean> => {
  if (!isConnected()) return false;
  try {
    const key = otpCooldownKey(email);
    const exists = await redisClient.exists(key);
    return exists === 1;
  } catch (error) {
    logger.error("Redis isOtpInCooldown error:", error);
    return false;
  }
};

/* ==========================================================================
   Login Lockout and Rate Limiting
   ========================================================================== */

export const isLoginLocked = async (
  ip: string,
  email: string,
): Promise<ILoginLockStatus> => {
  if (!isConnected()) {
    return { locked: false };
  }
  try {
    const ipCooldownKey = loginCooldownIpKey(ip);
    const emailCooldownKey = loginCooldownEmailKey(email);

    const [ipCooldownTtl, emailCooldownTtl] = await Promise.all([
      redisClient.ttl(ipCooldownKey),
      redisClient.ttl(emailCooldownKey),
    ]);

    if (ipCooldownTtl > 0) {
      return {
        locked: true,
        reason: "IP",
        retryAfter: ipCooldownTtl,
      };
    }

    if (emailCooldownTtl > 0) {
      return {
        locked: true,
        reason: "EMAIL",
        retryAfter: emailCooldownTtl,
      };
    }

    return { locked: false };
  } catch (error) {
    logger.error("Redis isLoginLocked error:", error);
    return { locked: false };
  }
};

export const recordFailedLogin = async (
  ip: string,
  email: string,
  maxAttempts = config.LOGIN_MAX_ATTEMPTS,
  windowSeconds = config.LOGIN_RATE_LIMIT_WINDOW,
  lockoutSeconds = config.LOGIN_LOCKOUT_DURATION,
): Promise<{ ipAttempts: number; emailAttempts: number; locked: boolean }> => {
  if (!isConnected()) {
    return { ipAttempts: 0, emailAttempts: 0, locked: false };
  }
  try {
    const ipAttemptsKey = loginAttemptsIpKey(ip);
    const emailAttemptsKey = loginAttemptsEmailKey(email);

    const [ipAttempts, emailAttempts] = await Promise.all([
      redisClient.incr(ipAttemptsKey),
      redisClient.incr(emailAttemptsKey),
    ]);

    if (ipAttempts === 1) {
      await redisClient.expire(ipAttemptsKey, windowSeconds);
    }
    if (emailAttempts === 1) {
      await redisClient.expire(emailAttemptsKey, windowSeconds);
    }

    let locked = false;

    if (ipAttempts >= maxAttempts) {
      await redisClient.set(loginCooldownIpKey(ip), "1", {
        EX: lockoutSeconds,
      });
      locked = true;
    }

    if (emailAttempts >= maxAttempts) {
      await redisClient.set(loginCooldownEmailKey(email), "1", {
        EX: lockoutSeconds,
      });
      locked = true;
    }

    return { ipAttempts, emailAttempts, locked };
  } catch (error) {
    logger.error("Redis recordFailedLogin error:", error);
    return { ipAttempts: 0, emailAttempts: 0, locked: false };
  }
};

export const resetEmailLoginAttempts = async (email: string): Promise<void> => {
  if (!isConnected()) return;
  try {
    const key = loginAttemptsEmailKey(email);
    await redisClient.del(key);
  } catch (error) {
    logger.error("Redis resetEmailLoginAttempts error:", error);
  }
};

/* ==========================================================================
   Password Reset Tokens
   ========================================================================== */

export const storePasswordResetToken = async (
  userId: string,
  hashedToken: string,
  ttlSeconds = config.PASSWORD_RESET_EXPIRES_IN,
): Promise<void> => {
  if (!isConnected()) {
    logger.warn(
      "Redis client is not connected; skipping storePasswordResetToken",
    );
    return;
  }
  try {
    const userKey = passwordResetKey(userId);
    const tokenMappingKey = passwordResetTokenMappingKey(hashedToken);

    await Promise.all([
      redisClient.set(userKey, hashedToken, { EX: ttlSeconds }),
      redisClient.set(tokenMappingKey, userId, { EX: ttlSeconds }),
    ]);
  } catch (error) {
    logger.error("Redis storePasswordResetToken error:", error);
  }
};

export const getUserIdByResetToken = async (
  hashedToken: string,
): Promise<string | null> => {
  if (!isConnected()) return null;
  try {
    const tokenMappingKey = passwordResetTokenMappingKey(hashedToken);
    return await redisClient.get(tokenMappingKey);
  } catch (error) {
    logger.error("Redis getUserIdByResetToken error:", error);
    return null;
  }
};

export const getPasswordResetToken = async (
  userId: string,
): Promise<string | null> => {
  if (!isConnected()) return null;
  try {
    const userKey = passwordResetKey(userId);
    return await redisClient.get(userKey);
  } catch (error) {
    logger.error("Redis getPasswordResetToken error:", error);
    return null;
  }
};

export const deletePasswordResetToken = async (
  userId: string,
  hashedToken?: string,
): Promise<void> => {
  if (!isConnected()) return;
  try {
    const userKey = passwordResetKey(userId);
    const promises: Promise<unknown>[] = [redisClient.del(userKey)];

    if (hashedToken) {
      promises.push(redisClient.del(passwordResetTokenMappingKey(hashedToken)));
    } else {
      const storedHashedToken = await redisClient.get(userKey);
      if (storedHashedToken) {
        promises.push(
          redisClient.del(passwordResetTokenMappingKey(storedHashedToken)),
        );
      }
    }

    await Promise.all(promises);
  } catch (error) {
    logger.error("Redis deletePasswordResetToken error:", error);
  }
};

/* ==========================================================================
   Refresh Token Session Tracking
   ========================================================================== */

export const storeRefreshToken = async (
  userId: string,
  hashedToken: string,
  ttlSeconds = 30 * 24 * 3600,
): Promise<void> => {
  if (!isConnected()) return;
  try {
    const key = refreshTokenKey(userId);
    await redisClient.set(key, hashedToken, { EX: ttlSeconds });
  } catch (error) {
    logger.error("Redis storeRefreshToken error:", error);
  }
};

export const getRefreshToken = async (
  userId: string,
): Promise<string | null> => {
  if (!isConnected()) return null;
  try {
    const key = refreshTokenKey(userId);
    return await redisClient.get(key);
  } catch (error) {
    logger.error("Redis getRefreshToken error:", error);
    return null;
  }
};

export const revokeRefreshToken = async (userId: string): Promise<void> => {
  if (!isConnected()) return;
  try {
    const key = refreshTokenKey(userId);
    await redisClient.del(key);
  } catch (error) {
    logger.error("Redis revokeRefreshToken error:", error);
  }
};

/* ==========================================================================
   Registration Rate Limiter
   ========================================================================== */

export const checkAndIncrementRegistrationRate = async (
  ip: string,
  maxRequests = config.REGISTER_MAX_ATTEMPTS,
  windowSeconds = config.REGISTER_RATE_LIMIT_WINDOW,
): Promise<IRegistrationRateStatus> => {
  if (!isConnected()) {
    return { allowed: true, remaining: maxRequests };
  }
  try {
    const key = registerRateKey(ip);
    const count = await redisClient.incr(key);

    if (count === 1) {
      await redisClient.expire(key, windowSeconds);
    }

    if (count > maxRequests) {
      const ttl = await redisClient.ttl(key);
      return {
        allowed: false,
        remaining: 0,
        retryAfter: ttl > 0 ? ttl : windowSeconds,
      };
    }

    return {
      allowed: true,
      remaining: maxRequests - count,
    };
  } catch (error) {
    logger.error("Redis checkAndIncrementRegistrationRate error:", error);
    return { allowed: true, remaining: maxRequests };
  }
};

/* ==========================================================================
   Verification Operations
   ========================================================================== */

export const setVerificationOtpCooldown = async (
  email: string,
  seconds = config.OTP_RESEND_COOLDOWN,
): Promise<void> => {
  if (!isConnected()) return;
  try {
    const key = verificationOtpCooldownKey(email);
    await redisClient.set(key, "1", { EX: seconds });
  } catch (error) {
    logger.error("Redis setVerificationOtpCooldown error:", error);
  }
};

export const isVerificationOtpInCooldown = async (
  email: string,
): Promise<boolean> => {
  if (!isConnected()) return false;
  try {
    const key = verificationOtpCooldownKey(email);
    const exists = await redisClient.exists(key);
    return exists === 1;
  } catch (error) {
    logger.error("Redis isVerificationOtpInCooldown error:", error);
    return false;
  }
};

export const clearVerificationOtpCooldown = async (
  email: string,
): Promise<void> => {
  if (!isConnected()) return;
  try {
    const key = verificationOtpCooldownKey(email);
    await redisClient.del(key);
  } catch (error) {
    logger.error("Redis clearVerificationOtpCooldown error:", error);
  }
};

export const checkAndIncrementVerificationSendRate = async (
  ip: string,
  maxRequests = 10,
  windowSeconds = 900,
): Promise<IRegistrationRateStatus> => {
  if (!isConnected()) {
    return { allowed: true, remaining: maxRequests };
  }
  try {
    const key = verificationSendAttemptsIpKey(ip);
    const count = await redisClient.incr(key);

    if (count === 1) {
      await redisClient.expire(key, windowSeconds);
    }

    if (count > maxRequests) {
      const ttl = await redisClient.ttl(key);
      return {
        allowed: false,
        remaining: 0,
        retryAfter: ttl > 0 ? ttl : windowSeconds,
      };
    }

    return {
      allowed: true,
      remaining: maxRequests - count,
    };
  } catch (error) {
    logger.error("Redis checkAndIncrementVerificationSendRate error:", error);
    return { allowed: true, remaining: maxRequests };
  }
};

export const checkAndIncrementVerificationVerifyRate = async (
  ip: string,
  maxRequests = 15,
  windowSeconds = 900,
): Promise<IRegistrationRateStatus> => {
  if (!isConnected()) {
    return { allowed: true, remaining: maxRequests };
  }
  try {
    const key = verificationVerifyAttemptsIpKey(ip);
    const count = await redisClient.incr(key);

    if (count === 1) {
      await redisClient.expire(key, windowSeconds);
    }

    if (count > maxRequests) {
      const ttl = await redisClient.ttl(key);
      return {
        allowed: false,
        remaining: 0,
        retryAfter: ttl > 0 ? ttl : windowSeconds,
      };
    }

    return {
      allowed: true,
      remaining: maxRequests - count,
    };
  } catch (error) {
    logger.error("Redis checkAndIncrementVerificationVerifyRate error:", error);
    return { allowed: true, remaining: maxRequests };
  }
};

export const AuthRedisService = {
  storeOtp,
  getOtp,
  deleteOtp,
  getOtpAttempts,
  incrementOtpAttempts,
  deleteOtpAttempts,
  setOtpCooldown,
  isOtpInCooldown,
  isLoginLocked,
  recordFailedLogin,
  resetEmailLoginAttempts,
  storePasswordResetToken,
  getUserIdByResetToken,
  getPasswordResetToken,
  deletePasswordResetToken,
  storeRefreshToken,
  getRefreshToken,
  revokeRefreshToken,
  checkAndIncrementRegistrationRate,
  setVerificationOtpCooldown,
  isVerificationOtpInCooldown,
  clearVerificationOtpCooldown,
  checkAndIncrementVerificationSendRate,
  checkAndIncrementVerificationVerifyRate,
};

export default AuthRedisService;
