export const VerificationPurpose = {
  EMAIL_VERIFICATION: "EMAIL_VERIFICATION",
  PASSWORD_RESET: "PASSWORD_RESET",
} as const;

export type TVerificationPurpose =
  (typeof VerificationPurpose)[keyof typeof VerificationPurpose];

export const VERIFICATION_MESSAGES = {
  OTP_SENT: "Verification OTP sent successfully to your email.",
  OTP_RESENT: "Verification OTP has been resent to your email.",
  EMAIL_VERIFIED: "Email verified successfully.",
  ALREADY_VERIFIED: "Your email is already verified.",
  OTP_EXPIRED: "Verification OTP has expired. Please request a new one.",
  OTP_INVALID: "Invalid verification OTP.",
  MAX_ATTEMPTS:
    "Maximum verification attempts exceeded. Please request a new OTP.",
  RESEND_COOLDOWN: "Please wait 60 seconds before requesting a new OTP.",
  RECORD_NOT_FOUND: "Verification record not found.",
} as const;
