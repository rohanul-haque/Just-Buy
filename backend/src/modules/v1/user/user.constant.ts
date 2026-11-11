export const UserRole = {
  BUYER: "BUYER",
  VENDOR: "VENDOR",
  ADMIN: "ADMIN",
} as const;

export type TUserRole = (typeof UserRole)[keyof typeof UserRole];

export const AccountStatus = {
  ACTIVE: "ACTIVE",
  BLOCKED: "BLOCKED",
} as const;

export type TAccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];
