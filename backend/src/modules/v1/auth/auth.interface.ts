import type { TUserRole } from "@/modules/v1/user/user.constant";

export interface IRegisterInput {
  name: string;
  email: string;
  password: string;
  role?: TUserRole;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IVerifyEmailInput {
  email: string;
  otp: string;
}

export interface IResendOtpInput {
  email: string;
}

export interface IForgotPasswordInput {
  email: string;
}

export interface IResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface IAuthUserSummary {
  id: string;
  name: string;
  email: string;
  role: TUserRole;
  isEmailVerified: boolean;
}

export interface IAuthResponse {
  user: IAuthUserSummary;
  accessToken: string;
  refreshToken: string;
  redirectUrl: string;
}

export interface IRegisterResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: TUserRole;
    isEmailVerified: boolean;
  };
  message: string;
}
