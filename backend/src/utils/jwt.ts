/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Module
 */
import jwt from "jsonwebtoken";

/**
 * Application Module
 */
import config from "@/config";

/**
 * Type
 */
import type { JwtPayload } from "jsonwebtoken";
import type { Types } from "mongoose";

/**
 * JWT Payload
 */
export interface IJwtPayload extends JwtPayload {
  userId: Types.ObjectId;
}

/**
 * Generate User Access Token
 */
export const generateAccessToken = (userId: Types.ObjectId): string => {
  return jwt.sign({ userId }, config.JWT_ACCESS_SECRET, {
    expiresIn: config.ACCESS_TOKEN_EXPIRY,
    subject: "accessToken",
  });
};

/**
 * Generate User Refresh Token
 */
export const generateRefreshToken = (userId: Types.ObjectId): string => {
  return jwt.sign({ userId }, config.JWT_REFRESH_SECRET, {
    expiresIn: config.REFRESH_TOKEN_EXPIRY,
    subject: "refreshToken",
  });
};

/**
 * Verify User Access Token
 */
export const verifyAccessToken = (token: string): IJwtPayload => {
  return jwt.verify(token, config.JWT_ACCESS_SECRET) as IJwtPayload;
};

/**
 * Verify User Refresh Token
 */
export const verifyRefreshToken = (token: string): IJwtPayload => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as IJwtPayload;
};
