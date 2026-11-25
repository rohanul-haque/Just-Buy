import config from "@/config";

export interface IOrderEmailData {
  recipientName: string;
  recipientRole: "BUYER" | "VENDOR";
  orderId: string;
  transactionNumber?: string;
  orderStatus: string;
  paymentMethod?: string;
  totalAmount: number;
  headline: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
}

export const renderOrderNotificationTemplate = (
  data: IOrderEmailData,
): string => {
  const {
    recipientName,
    orderId,
    transactionNumber,
    orderStatus,
    paymentMethod,
    totalAmount,
    headline,
    message,
    actionLabel = "View Order Details",
    actionUrl = `${config.CLIENT_URL}/orders/${orderId}`,
  } = data;

  const displayOrderNo = transactionNumber
    ? `#${transactionNumber}`
    : `#${orderId.slice(-7).toUpperCase()}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headline} - JustBuy</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px 16px; color: #171717; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; border-top: 4px solid #ff6200; overflow: hidden; }
    .header { padding: 24px 28px 12px; text-align: center; }
    .brand { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: #171717; }
    .brand span { color: #ff6200; }
    .content { padding: 12px 32px 32px; line-height: 1.6; }
    .title { font-size: 20px; font-weight: 700; color: #171717; text-align: center; margin: 0 0 8px; }
    .text { font-size: 14px; color: #4b5563; margin: 0 0 20px; }
    .summary-box { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #e5e7eb; }
    .row:last-child { border-bottom: none; }
    .label { color: #6b7280; }
    .value { font-weight: 600; color: #171717; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 9999px; background-color: #fff7ed; color: #ff6200; font-weight: 700; font-size: 12px; }
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
      <h1 class="title">${headline}</h1>
      <p class="text" style="margin-top: 16px;">Hello <strong>${recipientName}</strong>,</p>
      <p class="text">${message}</p>

      <div class="summary-box">
        <div class="row">
          <span class="label">Order Number</span>
          <span class="value">${displayOrderNo}</span>
        </div>
        <div class="row">
          <span class="label">Status</span>
          <span class="badge">${orderStatus}</span>
        </div>
        ${
          paymentMethod
            ? `<div class="row"><span class="label">Payment Method</span><span class="value">${paymentMethod}</span></div>`
            : ""
        }
        <div class="row">
          <span class="label">Total Amount</span>
          <span class="value">$${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div class="btn-container">
        <a href="${actionUrl}" class="btn">${actionLabel}</a>
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
