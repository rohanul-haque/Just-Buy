export const renderPasswordResetSuccessTemplate = (name: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed - JustBuy</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px 16px; color: #171717; }
    .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; border-top: 4px solid #ff6200; overflow: hidden; }
    .header { padding: 28px 28px 12px; text-align: center; }
    .brand { display: inline-block; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: #171717; }
    .brand span { color: #ff6200; }
    .content { padding: 12px 32px 32px; line-height: 1.6; }
    .title { font-size: 20px; font-weight: 700; color: #171717; text-align: center; margin: 0 0 16px; }
    .greeting { font-size: 15px; font-weight: 600; color: #171717; margin-bottom: 10px; }
    .alert { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px 16px; border-radius: 10px; font-size: 14px; color: #166534; margin: 16px 0; }
    .text { font-size: 14px; color: #4b5563; margin: 0 0 14px; }
    .footer { background-color: #f9fafb; padding: 18px 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">Just<span>Buy</span></div>
    </div>
    <div class="content">
      <h1 class="title">Password Changed</h1>
      <div class="greeting">Hello ${name},</div>
      <div class="alert">
        Your JustBuy account password has been changed successfully.
      </div>
      <p class="text">
        All previous active sessions have been signed out for security. You may now log in using your new password.
      </p>
      <p class="text" style="font-size: 13px; color: #6b7280; margin-bottom: 0;">
        If you did not initiate this change, please contact our support team immediately.
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
