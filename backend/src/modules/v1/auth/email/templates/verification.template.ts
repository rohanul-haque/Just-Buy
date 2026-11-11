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
  <title>Email Verification - Jus Buy</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; color: #1f2937; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background: #2563eb; padding: 28px 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
    .content { padding: 32px 28px; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 12px; }
    .otp-card { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0; }
    .otp-code { font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #2563eb; margin: 0; font-family: monospace; }
    .otp-info { font-size: 13px; color: #64748b; margin-top: 8px; }
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
      <p>Thank you for registering with <strong>Jus Buy</strong>. Please use the following One-Time Password (OTP) to complete your email verification:</p>
      
      <div class="otp-card">
        <div class="otp-code">${otp}</div>
        <div class="otp-info">This code is valid for <strong>${expiresInMinutes} minutes</strong>. Single use only.</div>
      </div>

      <p>If you did not request this verification, please safely ignore this email. Do not share this OTP with anyone.</p>
      <p style="margin-top: 24px;">Warm regards,<br><strong>The Jus Buy Team</strong></p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Jus Buy. All rights reserved.
    </div>
  </div>
</body>
</html>
  `.trim();
};
