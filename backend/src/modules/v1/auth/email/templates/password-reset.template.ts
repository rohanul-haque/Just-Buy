import config from "@/config";
import type { IPasswordResetEmailData } from "@/modules/v1/auth/email/email.interface";

export const renderPasswordResetTemplate = (
  data: IPasswordResetEmailData,
): string => {
  const { name, resetToken, expiresInMinutes = 5 } = data;
  const resetUrl = `${config.CLIENT_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - JustBuy</title>
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
    .text { font-size: 14px; color: #4b5563; margin: 0 0 24px; }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { background-color: #ff6200; color: #ffffff !important; padding: 13px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block; }
    .notice { background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #9a3412; margin: 20px 0 0; }
    .footer { background-color: #f9fafb; padding: 18px 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">Just<span>Buy</span></div>
    </div>
    <div class="content">
      <h1 class="title">Reset Your Password</h1>
      <p class="subtitle">We received a request to reset your account password.</p>

      <div class="greeting">Hello ${name},</div>
      <p class="text">
        Click the button below to choose a new password for your JustBuy account.
      </p>

      <div class="btn-container">
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </div>

      <div class="notice">
        <strong>Security Notice:</strong> This Reset Password button will expire in <strong>${expiresInMinutes} minutes</strong>. If you did not request a password reset, you can safely ignore this email.
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} JustBuy. All rights reserved.
    </div>
  </div>
</body>
</html>
  `.trim();
};
