/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * User Roles Enum
 */
export enum UserRole {
  BUYER = "buyer",
  SELLER = "seller",
  ADMIN = "admin",
}

/**
 * User Interface
 */
export interface IUser {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

/**
 * Register Request Interface
 */
export interface IRegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role: UserRole.BUYER | UserRole.SELLER | UserRole.ADMIN;
}

/**
 * Login Request Interface
 */
export interface ILoginPayload {
  email: string;
  password: string;
}

/**
 * Auth Response Interface
 */
export interface AuthResponse {
  user: {
    fullName: string;
    email: string;
    role: UserRole;
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * Forgot Password Request Interface
 */
export interface IForgotPasswordPayload {
  email: string;
}

/**
 * Reset Password Request Interface
 */
export interface IResetPasswordPaylod {
  email: string;
  otp: string | number;
  newPassword: string;
}
