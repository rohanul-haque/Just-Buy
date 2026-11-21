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
  <title>Welcome Vendor - Jus Buy</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; color: #1f2937; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background: #16a34a; padding: 28px 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; }
    .content { padding: 32px 28px; line-height: 1.6; }
    .greeting { font-size: 20px; font-weight: 700; color: #16a34a; margin-bottom: 12px; }
    .feature-list { list-style: none; padding: 0; margin: 20px 0; }
    .feature-list li { padding: 10px 0; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; }
    .feature-list li strong { color: #16a34a; margin-right: 8px; }
    .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Jus Buy Vendors</h1>
    </div>
    <div class="content">
      <div class="greeting">Welcome Vendor, ${name}!</div>
      <p>Congratulations on registering as a vendor on <strong>Jus Buy</strong>. We are thrilled to partner with you to grow your business.</p>
      
      <ul class="feature-list">
        <li><strong>✓</strong> Set up and personalize your independent vendor shop</li>
        <li><strong>✓</strong> Upload verification documents for quick admin review</li>
        <li><strong>✓</strong> List products, size variants, stock, and competitive pricing</li>
        <li><strong>✓</strong> Manage orders and track your sales with transparent 85% earnings</li>
      </ul>

      <p>Next steps: Please verify your email, log in to your vendor dashboard, and submit your shop profile and verification documents to start selling.</p>
      <p style="margin-top: 24px;">To your success,<br><strong>The Jus Buy Vendor Team</strong></p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Jus Buy. All rights reserved.
    </div>
  </div>
</body>
</html>
  `.trim();
};
