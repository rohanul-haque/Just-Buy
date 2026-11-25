export interface IAccountStatusEmailData {
  name: string;
  role: "BUYER" | "VENDOR";
  status: string;
  headline: string;
  message: string;
}

export const renderAccountStatusTemplate = (
  data: IAccountStatusEmailData,
): string => {
  const { name, role, status, headline, message } = data;
  const isPositive = status === "ACTIVE" || status === "APPROVED";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headline} - JustBuy</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px 16px; color: #171717; }
    .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; border-top: 4px solid #ff6200; overflow: hidden; }
    .header { padding: 24px 28px 12px; text-align: center; }
    .brand { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: #171717; }
    .brand span { color: #ff6200; }
    .content { padding: 12px 32px 32px; line-height: 1.6; }
    .title { font-size: 20px; font-weight: 700; color: #171717; text-align: center; margin: 0 0 12px; }
    .text { font-size: 14px; color: #4b5563; margin: 0 0 16px; }
    .status-box { border-radius: 10px; padding: 14px 16px; font-size: 13px; margin: 20px 0; border: 1px solid ${
      isPositive ? "#bbf7d0" : "#fecaca"
    }; background-color: ${isPositive ? "#f0fdf4" : "#fef2f2"}; color: ${
      isPositive ? "#166534" : "#991b1b"
    }; }
    .footer { background-color: #f9fafb; padding: 18px 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">Just<span>Buy</span></div>
    </div>
    <div class="content">
      <h1 class="title">${headline}</h1>
      <p class="text">Hello <strong>${name}</strong>,</p>
      <p class="text">${message}</p>

      <div class="status-box">
        <strong>Account Type:</strong> ${role}<br />
        <strong>Current Status:</strong> ${status}
      </div>

      <p class="text" style="font-size: 13px; color: #6b7280; margin-bottom: 0;">
        If you have any questions about this update, please contact our support team.
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
