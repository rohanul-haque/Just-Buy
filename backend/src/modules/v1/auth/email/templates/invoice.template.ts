import config from "@/config";
import type { IInvoiceData } from "@/modules/v1/auth/email/utils/invoice-pdf";

export const renderInvoiceEmailTemplate = (data: IInvoiceData): string => {
  const {
    invoiceNumber,
    orderId,
    transactionNumber,
    buyerName,
    items,
    subtotal,
    shippingCharge,
    totalAmount,
    currency,
  } = data;

  const displayOrderNo = transactionNumber
    ? `#${transactionNumber}`
    : `#${orderId.slice(-7).toUpperCase()}`;

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 8px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #171717;">
          ${item.name}${item.size ? ` <span style="color:#6b7280;">(${item.size})</span>` : ""}
        </td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #4b5563; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #171717; font-weight: 600; text-align: right;">
          $${item.itemSubtotal.toFixed(2)}
        </td>
      </tr>`,
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Invoice ${invoiceNumber} - JustBuy</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px 16px; color: #171717; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; border-top: 4px solid #ff6200; overflow: hidden; }
    .header { padding: 24px 28px 12px; text-align: center; }
    .brand { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: #171717; }
    .brand span { color: #ff6200; }
    .content { padding: 12px 32px 32px; line-height: 1.6; }
    .title { font-size: 20px; font-weight: 700; color: #171717; text-align: center; margin: 0 0 6px; }
    .subtitle { font-size: 13px; color: #6b7280; text-align: center; margin: 0 0 20px; }
    .meta { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 16px; font-size: 13px; margin-bottom: 20px; }
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
      <h1 class="title">Payment Invoice</h1>
      <p class="subtitle">Invoice ${invoiceNumber} &bull; Order ${displayOrderNo}</p>

      <p style="font-size: 14px; color: #4b5563;">
        Hello <strong>${buyerName}</strong>, thank you for your online payment. Your PDF invoice is attached to this email.
      </p>

      <div class="meta">
        <strong>Payment Status:</strong> <span style="color:#059669; font-weight:700;">PAID (${currency.toUpperCase()})</span><br />
        <strong>Invoice Number:</strong> ${invoiceNumber}<br />
        <strong>Order Number:</strong> ${displayOrderNo}
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <thead>
          <tr style="background-color: #fff7ed;">
            <th style="padding: 10px 8px; text-align: left; font-size: 12px; color: #9a3412; border-bottom: 1px solid #fed7aa;">Product</th>
            <th style="padding: 10px 8px; text-align: center; font-size: 12px; color: #9a3412; border-bottom: 1px solid #fed7aa;">Qty</th>
            <th style="padding: 10px 8px; text-align: right; font-size: 12px; color: #9a3412; border-bottom: 1px solid #fed7aa;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <div style="text-align: right; font-size: 13px; color: #4b5563; line-height: 1.8;">
        <div>Subtotal: <strong style="color:#171717;">$${subtotal.toFixed(2)}</strong></div>
        <div>Shipping: <strong style="color:#171717;">$${shippingCharge.toFixed(2)}</strong></div>
        <div style="font-size: 15px; color: #ff6200; font-weight: 700; margin-top: 4px;">
          Total Paid: $${totalAmount.toFixed(2)}
        </div>
      </div>

      <div class="btn-container">
        <a href="${config.CLIENT_URL}/orders/${orderId}" class="btn">View Order Details</a>
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
