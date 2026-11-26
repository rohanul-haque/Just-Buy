import type { IWelcomeEmailData } from "@/modules/v1/auth/email/email.interface";

export const renderWelcomeVendorTemplate = (
  data: IWelcomeEmailData,
): string => {
  const { name } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome Vendor - JustBuy</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px 16px; color: #171717; }
    .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; border-top: 4px solid #ff6200; overflow: hidden; }
    .header { padding: 28px 28px 12px; text-align: center; }
    .brand { display: inline-block; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: #171717; }
    .brand span { color: #ff6200; }
    .badge { display: inline-block; margin-top: 6px; padding: 2px 10px; border-radius: 9999px; background-color: #fff7ed; border: 1px solid #fed7aa; color: #ff6200; font-size: 11px; font-weight: 700; }
    .content { padding: 12px 32px 32px; line-height: 1.6; }
    .title { font-size: 20px; font-weight: 700; color: #171717; text-align: center; margin: 0 0 8px; }
    .subtitle { font-size: 14px; color: #6b7280; text-align: center; margin: 0 0 22px; }
    .text { font-size: 14px; color: #4b5563; margin: 0 0 18px; }
    .feature-box { background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 14px 18px; margin: 18px 0 20px; }
    .feature-list { list-style: none; padding: 0; margin: 0; }
    .feature-list li { padding: 8px 0; border-bottom: 1px solid #fed7aa; font-size: 13px; color: #374151; }
    .feature-list li:last-child { border-bottom: none; }
    .check { color: #ff6200; font-weight: 700; margin-right: 8px; }
    .footer { background-color: #f9fafb; padding: 18px 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">Just<span>Buy</span></div>
      <div><span class="badge">Vendor Partner</span></div>
    </div>
    <div class="content">
      <h1 class="title">Welcome Vendor, ${name}!</h1>
      <p class="subtitle">Partner with JustBuy and grow your store online.</p>

      <p class="text">
        Congratulations on registering as a vendor on <strong>JustBuy</strong>. Once verified and approved, you can manage your entire store from the Vendor Dashboard:
      </p>

      <div class="feature-box">
        <ul class="feature-list">
          <li><span class="check">&#10003;</span> Set up and personalize your independent vendor shop</li>
          <li><span class="check">&#10003;</span> Upload verification documents for quick admin review</li>
          <li><span class="check">&#10003;</span> List products, size variants, stock, and competitive pricing</li>
          <li><span class="check">&#10003;</span> Manage orders and track your earnings transparently</li>
        </ul>
      </div>

      <p class="text" style="font-size: 13px; color: #6b7280; margin-bottom: 0;">
        Next steps: Log in to your vendor dashboard and complete your shop profile to start selling.
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
