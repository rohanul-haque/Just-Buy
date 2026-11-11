export const renderPasswordResetSuccessTemplate = (name: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed - Jus Buy</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; color: #1f2937; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background: #16a34a; padding: 28px 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; }
    .content { padding: 32px 28px; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 12px; }
    .alert { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px 16px; border-radius: 4px; font-size: 14px; color: #166534; margin: 20px 0; }
    .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Jus Buy Security</h1>
    </div>
    <div class="content">
      <div class="greeting">Hello, ${name}!</div>
      <div class="alert">
        Your Jus Buy account password has been changed successfully.
      </div>
      <p>All previous active refresh sessions have been terminated for security. You may now log in using your new credentials.</p>
      <p>If you did not initiate this change, please contact our support team immediately to protect your account.</p>
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
