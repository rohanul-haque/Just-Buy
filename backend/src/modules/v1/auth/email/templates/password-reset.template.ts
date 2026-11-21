import config from "@/config";
import type { IPasswordResetEmailData } from "@/modules/v1/auth/email/email.interface";

export const renderPasswordResetTemplate = (
  data: IPasswordResetEmailData,
): string => {
  const { name, resetToken, expiresInMinutes = 15 } = data;
  const resetUrl = `${config.CLIENT_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Jus Buy</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; color: #1f2937; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background: #2563eb; padding: 28px 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; }
    .content { padding: 32px 28px; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 12px; }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { background: #2563eb; color: #ffffff !important; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; }
    .token-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; word-break: break-all; font-family: monospace; font-size: 13px; color: #475569; margin: 16px 0; }
    .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #991b1b; margin: 20px 0; }
    .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Jus Buy</h1>
    </div>
    <div class="content">
      <div class="greeting">Hello, ${name}!</div>
      <p>We received a request to reset your password for your Jus Buy account. Click the button below to choose a new password:</p>
      
      <div class="btn-container">
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </div>

      <p style="font-size: 14px; color: #64748b;">Or use this token directly in your application:</p>
      <div class="token-box">${resetToken}</div>

      <div class="warning">
        This link and token will expire in <strong>${expiresInMinutes} minutes</strong>. If you did not make this request, please disregard this email. Your password will remain unchanged.
      </div>

      <p style="margin-top: 24px;">Sincerely,<br><strong>The Jus Buy Security Team</strong></p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Jus Buy. All rights reserved.
    </div>
  </div>
</body>
</html>
  `.trim();
};

