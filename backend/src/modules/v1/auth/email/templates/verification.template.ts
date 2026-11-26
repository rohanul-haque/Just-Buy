import type { IVerificationEmailData } from "@/modules/v1/auth/email/email.interface";

export const renderVerificationTemplate = (
  data: IVerificationEmailData,
): string => {
  const { name, otp, expiresInMinutes = 5 } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification - JustBuy</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px 16px; color: #171717; }
    .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; border-top: 4px solid #ff6200; overflow: hidden; }
    .header { padding: 28px 28px 12px; text-align: center; }
    .brand { display: inline-block; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: #171717; }
    .brand span { color: #ff6200; }
    .content { padding: 12px 32px 32px; line-height: 1.6; }
    .title { font-size: 20px; font-weight: 700; color: #171717; text-align: center; margin: 0 0 8px; }
    .subtitle { font-size: 14px; color: #6b7280; text-align: center; margin: 0 0 24px; }
    .greeting { font-size: 15px; font-weight: 600; color: #171717; margin-bottom: 10px; }
    .text { font-size: 14px; color: #4b5563; margin: 0 0 20px; }
    .otp-card { background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 22px; text-align: center; margin: 24px 0; }
    .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ff6200; margin: 0; font-family: monospace; }
    .otp-info { font-size: 13px; color: #9a3412; margin-top: 8px; }
    .footer { background-color: #f9fafb; padding: 18px 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">Just<span>Buy</span></div>
    </div>
    <div class="content">
      <h1 class="title">Verify Your Email</h1>
      <p class="subtitle">Use the 5-digit code below to activate your account.</p>

      <div class="greeting">Hello ${name},</div>
      <p class="text">
        Thank you for registering with <strong>JustBuy</strong>. Please enter the following One-Time Password (OTP) to complete your verification:
      </p>

      <div class="otp-card">
        <div class="otp-code">${otp}</div>
        <div class="otp-info">This code is valid for <strong>${expiresInMinutes} minutes</strong>. Single use only.</div>
      </div>

      <p class="text" style="font-size: 13px; color: #6b7280; margin-bottom: 0;">
        If you did not request this verification, you can safely ignore this email. Never share this OTP with anyone.
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} JustBuy. All rights reserved.
    </div>
  </div>
</body>
</html>
  `.trim();
};
