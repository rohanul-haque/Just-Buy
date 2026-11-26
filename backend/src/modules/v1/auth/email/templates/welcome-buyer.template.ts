import config from "@/config";
import type { IWelcomeEmailData } from "@/modules/v1/auth/email/email.interface";

export const renderWelcomeBuyerTemplate = (data: IWelcomeEmailData): string => {
  const { name } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to JustBuy</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px 16px; color: #171717; }
    .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; border-top: 4px solid #ff6200; overflow: hidden; }
    .header { padding: 28px 28px 12px; text-align: center; }
    .brand { display: inline-block; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: #171717; }
    .brand span { color: #ff6200; }
    .content { padding: 12px 32px 32px; line-height: 1.6; }
    .title { font-size: 20px; font-weight: 700; color: #171717; text-align: center; margin: 0 0 8px; }
    .subtitle { font-size: 14px; color: #6b7280; text-align: center; margin: 0 0 22px; }
    .text { font-size: 14px; color: #4b5563; margin: 0 0 18px; }
    .feature-box { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px 18px; margin: 18px 0 24px; }
    .feature-list { list-style: none; padding: 0; margin: 0; }
    .feature-list li { padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #374151; }
    .feature-list li:last-child { border-bottom: none; }
    .check { color: #ff6200; font-weight: 700; margin-right: 8px; }
    .btn-container { text-align: center; margin: 24px 0 8px; }
    .btn { background-color: #ff6200; color: #ffffff !important; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block; }
    .footer { background-color: #f9fafb; padding: 18px 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">Just<span>Buy</span></div>
    </div>
    <div class="content">
      <h1 class="title">Welcome to JustBuy, ${name}!</h1>
      <p class="subtitle">Your buyer account is verified and ready to use.</p>

      <p class="text">
        We are delighted to have you on board our multi-vendor marketplace. Here is what you can do next:
      </p>

      <div class="feature-box">
        <ul class="feature-list">
          <li><span class="check">&#10003;</span> Discover products across verified independent vendors</li>
          <li><span class="check">&#10003;</span> Save favorite items to your personal wishlist</li>
          <li><span class="check">&#10003;</span> Enjoy fast checkout via Stripe or Cash on Delivery</li>
          <li><span class="check">&#10003;</span> Track your orders in real time from your profile</li>
        </ul>
      </div>

      <div class="btn-container">
        <a href="${config.CLIENT_URL}/products" class="btn">Start Shopping</a>
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
