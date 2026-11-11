import config from "@/config";
import type { CookieOptions, Response } from "express";
import ms from "ms";

const getBaseCookieOptions = (): CookieOptions => {
  const isProduction = config.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
): void => {
  const baseOptions = getBaseCookieOptions();
  const accessExpiryMs =
    typeof config.ACCESS_TOKEN_EXPIRY === "string"
      ? (ms(config.ACCESS_TOKEN_EXPIRY as ms.StringValue) ?? 3600000)
      : 3600000;

  const refreshExpiryMs =
    typeof config.REFRESH_TOKEN_EXPIRY === "string"
      ? (ms(config.REFRESH_TOKEN_EXPIRY as ms.StringValue) ?? 2592000000)
      : 2592000000;

  res.cookie("accessToken", accessToken, {
    ...baseOptions,
    maxAge: accessExpiryMs,
  });

  res.cookie("refreshToken", refreshToken, {
    ...baseOptions,
    maxAge: refreshExpiryMs,
  });
};

export const clearAuthCookies = (res: Response): void => {
  const baseOptions = getBaseCookieOptions();
  res.clearCookie("accessToken", baseOptions);
  res.clearCookie("refreshToken", baseOptions);
};
