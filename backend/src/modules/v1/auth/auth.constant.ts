import type { TUserRole } from "@/modules/v1/user/user.constant";

export const RoleRedirectPath: Record<TUserRole, string> = {
  BUYER: "/profile",
  VENDOR: "/vendor/dashboard",
  ADMIN: "/admin/dashboard",
} as const;

export const AuthCookieNames = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
} as const;

