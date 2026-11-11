import config from "@/config";
import jwt from "jsonwebtoken";
import type { JwtPayload, SignOptions } from "jsonwebtoken";

export interface IJwtPayload extends JwtPayload {
  userId: string;
  role: "BUYER" | "VENDOR" | "ADMIN";
}

export const generateAccessToken = (payload: {
  userId: string;
  role: "BUYER" | "VENDOR" | "ADMIN";
}): string => {
  const options: SignOptions = {
    expiresIn: config.ACCESS_TOKEN_EXPIRY,
    subject: "accessToken",
  };

  return jwt.sign(payload, config.JWT_ACCESS_SECRET, options);
};

export const generateRefreshToken = (payload: {
  userId: string;
  role: "BUYER" | "VENDOR" | "ADMIN";
}): string => {
  const options: SignOptions = {
    expiresIn: config.REFRESH_TOKEN_EXPIRY,
    subject: "refreshToken",
  };

  return jwt.sign(payload, config.JWT_REFRESH_SECRET, options);
};

export const verifyAccessToken = (token: string): IJwtPayload => {
  return jwt.verify(token, config.JWT_ACCESS_SECRET) as IJwtPayload;
};

export const verifyRefreshToken = (token: string): IJwtPayload => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as IJwtPayload;
};
