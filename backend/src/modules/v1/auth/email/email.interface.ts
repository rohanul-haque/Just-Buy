export interface ISendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface IVerificationEmailData {
  name: string;
  otp: string;
  expiresInMinutes?: number;
}

export interface IWelcomeEmailData {
  name: string;
  email: string;
}

export interface IPasswordResetEmailData {
  name: string;
  resetToken: string;
  expiresInMinutes?: number;
}

