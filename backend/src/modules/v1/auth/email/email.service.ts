import config from "@/config";
import { logger } from "@/lib/winston";
import { EmailSubject } from "@/modules/v1/auth/email/email.constant";
import type { ISendEmailOptions } from "@/modules/v1/auth/email/email.interface";
import emailTransporter from "@/modules/v1/auth/email/email.transporter";
import { renderAccountStatusTemplate } from "@/modules/v1/auth/email/templates/account-status.template";
import { renderInvoiceEmailTemplate } from "@/modules/v1/auth/email/templates/invoice.template";
import { renderOrderNotificationTemplate } from "@/modules/v1/auth/email/templates/order-notification.template";
import { renderPasswordResetSuccessTemplate } from "@/modules/v1/auth/email/templates/password-reset-success.template";
import { renderPasswordResetTemplate } from "@/modules/v1/auth/email/templates/password-reset.template";
import { renderVerificationTemplate } from "@/modules/v1/auth/email/templates/verification.template";
import { renderWelcomeAdminTemplate } from "@/modules/v1/auth/email/templates/welcome-admin.template";
import { renderWelcomeBuyerTemplate } from "@/modules/v1/auth/email/templates/welcome-buyer.template";
import { renderWelcomeVendorTemplate } from "@/modules/v1/auth/email/templates/welcome-vendor.template";
import {
  generateInvoicePdfBuffer,
  type IInvoiceItem,
} from "@/modules/v1/auth/email/utils/invoice-pdf";
import User from "@/modules/v1/user/user.model";
import Vendor from "@/modules/v1/vendor/vendor.model";

const sendEmail = async (options: ISendEmailOptions): Promise<void> => {
  const { to, subject, html, text, attachments } = options;

  try {
    await emailTransporter.sendMail({
      from: `"${config.EMAIL_FROM || "JustBuy"}" <${config.EMAIL_USER}>`,
      to,
      subject,
      html,
      ...(text && { text }),
      ...(attachments && attachments.length > 0 && { attachments }),
    });

    logger.info("Email sent successfully", {
      to,
      subject,
    });
  } catch (error) {
    logger.error("Failed to send email:", {
      to,
      subject,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const sendVerificationEmail = async (
  to: string,
  name: string,
  otp: string,
): Promise<void> => {
  const html = renderVerificationTemplate({
    name,
    otp,
    expiresInMinutes: Math.floor(config.OTP_EXPIRES_IN / 60),
  });

  await sendEmail({
    to,
    subject: EmailSubject.VERIFICATION,
    html,
  });
};

const sendWelcomeEmail = async (
  to: string,
  name: string,
  role: string,
): Promise<void> => {
  let html: string;
  let subject: string;

  if (role === "VENDOR") {
    html = renderWelcomeVendorTemplate({ name, email: to });
    subject = EmailSubject.WELCOME_VENDOR;
  } else if (role === "ADMIN") {
    html = renderWelcomeAdminTemplate({ name, email: to });
    subject = EmailSubject.WELCOME_ADMIN;
  } else {
    html = renderWelcomeBuyerTemplate({ name, email: to });
    subject = EmailSubject.WELCOME_BUYER;
  }

  await sendEmail({
    to,
    subject,
    html,
  });
};

const sendPasswordResetEmail = async (
  to: string,
  name: string,
  resetToken: string,
): Promise<void> => {
  const html = renderPasswordResetTemplate({
    name,
    resetToken,
    expiresInMinutes: Math.floor(config.PASSWORD_RESET_EXPIRES_IN / 60),
  });

  await sendEmail({
    to,
    subject: EmailSubject.PASSWORD_RESET,
    html,
  });
};

const sendPasswordResetSuccessEmail = async (
  to: string,
  name: string,
): Promise<void> => {
  const html = renderPasswordResetSuccessTemplate(name);

  await sendEmail({
    to,
    subject: EmailSubject.PASSWORD_RESET_SUCCESS,
    html,
  });
};

interface IOrderNotificationInput {
  orderId: string;
  buyerId: string;
  vendorId: string;
  transactionNumber?: string;
  status: string;
  orderType?: string;
  totalAmount: number;
}

const resolveBuyerAndVendorUsers = async (
  buyerId: string,
  vendorId: string,
) => {
  const [buyerUser, vendorDoc] = await Promise.all([
    User.findById(buyerId).select("name email").lean().exec(),
    Vendor.findById(vendorId)
      .populate("vendor", "name email")
      .lean()
      .exec(),
  ]);

  const vendorUser = (vendorDoc as any)?.vendor as
    | { name?: string; email?: string }
    | undefined;

  return { buyerUser, vendorUser };
};

const sendOrderCreatedEmails = async (
  input: IOrderNotificationInput,
): Promise<void> => {
  const { buyerUser, vendorUser } = await resolveBuyerAndVendorUsers(
    input.buyerId,
    input.vendorId,
  );

  const tasks: Promise<void>[] = [];

  if (buyerUser?.email) {
    const buyerHtml = renderOrderNotificationTemplate({
      recipientName: buyerUser.name || "Customer",
      recipientRole: "BUYER",
      orderId: input.orderId,
      transactionNumber: input.transactionNumber,
      orderStatus: input.status,
      paymentMethod: input.orderType,
      totalAmount: input.totalAmount,
      headline: "Order Completed & Confirmed!",
      message:
        "Thank you for shopping with JustBuy. Your order has been successfully placed and is now being processed.",
    });

    tasks.push(
      sendEmail({
        to: buyerUser.email,
        subject: EmailSubject.ORDER_CONFIRMED,
        html: buyerHtml,
      }),
    );
  }

  if (vendorUser?.email) {
    const vendorHtml = renderOrderNotificationTemplate({
      recipientName: vendorUser.name || "Vendor",
      recipientRole: "VENDOR",
      orderId: input.orderId,
      transactionNumber: input.transactionNumber,
      orderStatus: input.status,
      paymentMethod: input.orderType,
      totalAmount: input.totalAmount,
      headline: "You Have a New Order!",
      message:
        "A new order has been placed for your store on JustBuy. Please review and process it from your Vendor Dashboard.",
      actionLabel: "Manage Orders",
      actionUrl: `${config.CLIENT_URL}`,
    });

    tasks.push(
      sendEmail({
        to: vendorUser.email,
        subject: EmailSubject.ORDER_NEW_VENDOR,
        html: vendorHtml,
      }),
    );
  }

  await Promise.allSettled(tasks);
};

const sendOrderStatusUpdatedEmail = async (
  input: IOrderNotificationInput & { updatedBy: "BUYER" | "VENDOR" | "ADMIN" },
): Promise<void> => {
  const { buyerUser, vendorUser } = await resolveBuyerAndVendorUsers(
    input.buyerId,
    input.vendorId,
  );

  const tasks: Promise<void>[] = [];

  if (input.updatedBy === "BUYER") {
    // Buyer cancelled/updated order -> notify Vendor + confirm to Buyer
    if (vendorUser?.email) {
      const vendorHtml = renderOrderNotificationTemplate({
        recipientName: vendorUser.name || "Vendor",
        recipientRole: "VENDOR",
        orderId: input.orderId,
        transactionNumber: input.transactionNumber,
        orderStatus: input.status,
        paymentMethod: input.orderType,
        totalAmount: input.totalAmount,
        headline: `Order ${input.status}`,
        message: `The buyer has updated the order status to ${input.status}.`,
        actionLabel: "View Vendor Orders",
        actionUrl: `${config.CLIENT_URL}`,
      });

      tasks.push(
        sendEmail({
          to: vendorUser.email,
          subject: EmailSubject.ORDER_CANCELLED_VENDOR,
          html: vendorHtml,
        }),
      );
    }

    if (buyerUser?.email) {
      const buyerHtml = renderOrderNotificationTemplate({
        recipientName: buyerUser.name || "Customer",
        recipientRole: "BUYER",
        orderId: input.orderId,
        transactionNumber: input.transactionNumber,
        orderStatus: input.status,
        paymentMethod: input.orderType,
        totalAmount: input.totalAmount,
        headline: `Order ${input.status}`,
        message: `Your order status has been updated to ${input.status}.`,
      });

      tasks.push(
        sendEmail({
          to: buyerUser.email,
          subject: EmailSubject.ORDER_STATUS_UPDATED,
          html: buyerHtml,
        }),
      );
    }
  } else {
    // Vendor or Admin updated status -> notify Buyer
    if (buyerUser?.email) {
      const buyerHtml = renderOrderNotificationTemplate({
        recipientName: buyerUser.name || "Customer",
        recipientRole: "BUYER",
        orderId: input.orderId,
        transactionNumber: input.transactionNumber,
        orderStatus: input.status,
        paymentMethod: input.orderType,
        totalAmount: input.totalAmount,
        headline: `Order Status Updated: ${input.status}`,
        message: `Your order status has been updated to ${input.status}.`,
      });

      tasks.push(
        sendEmail({
          to: buyerUser.email,
          subject: EmailSubject.ORDER_STATUS_UPDATED,
          html: buyerHtml,
        }),
      );
    }
  }

  await Promise.allSettled(tasks);
};

const sendAccountStatusEmail = async (params: {
  to: string;
  name: string;
  role: "BUYER" | "VENDOR";
  status: string;
}): Promise<void> => {
  const { to, name, role, status } = params;

  let headline = `Account Status: ${status}`;
  let message = `Your ${role.toLowerCase()} account status on JustBuy has been updated to ${status}.`;

  if (status === "BLOCKED" || status === "SUSPENDED") {
    headline = "Your Account Has Been Restricted";
    message = `Your ${role.toLowerCase()} account on JustBuy has been ${status.toLowerCase()} by an administrator. You will not be able to access account features until this restriction is lifted.`;
  } else if (status === "REJECTED") {
    headline = "Vendor Application Update";
    message =
      "Your vendor application on JustBuy was not approved at this time. Please contact support for more details.";
  } else if (status === "ACTIVE" || status === "APPROVED") {
    headline =
      status === "APPROVED"
        ? "Vendor Account Approved!"
        : "Your Account Is Active!";
    message =
      status === "APPROVED"
        ? "Congratulations! Your JustBuy vendor account has been approved. You can now add products and manage orders."
        : "Your JustBuy account has been reactivated. You can now sign in and continue shopping.";
  }

  const html = renderAccountStatusTemplate({
    name,
    role,
    status,
    headline,
    message,
  });

  await sendEmail({
    to,
    subject: EmailSubject.ACCOUNT_STATUS_UPDATED,
    html,
  });
};

const sendOnlinePaymentInvoiceEmail = async (params: {
  orderId: string;
  buyerId: string;
  transactionNumber?: string;
  paidAt: Date;
  currency: string;
  shippingAddress?: {
    fullName?: string;
    phoneNumber?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  items: IInvoiceItem[];
  subtotal: number;
  shippingCharge: number;
  totalAmount: number;
}): Promise<void> => {
  const buyerUser = await User.findById(params.buyerId)
    .select("name email")
    .lean()
    .exec();

  if (!buyerUser?.email) return;

  const invoiceNumber = `INV-${
    params.transactionNumber || params.orderId.slice(-7).toUpperCase()
  }`;

  const invoiceData = {
    invoiceNumber,
    orderId: params.orderId,
    transactionNumber: params.transactionNumber,
    paidAt: params.paidAt,
    currency: params.currency || "USD",
    paymentMethod: "ONLINE (Stripe)",
    buyerName: buyerUser.name || "Customer",
    buyerEmail: buyerUser.email,
    shippingAddress: params.shippingAddress,
    items: params.items,
    subtotal: params.subtotal,
    shippingCharge: params.shippingCharge,
    totalAmount: params.totalAmount,
  };

  const [pdfBuffer, html] = await Promise.all([
    generateInvoicePdfBuffer(invoiceData),
    Promise.resolve(renderInvoiceEmailTemplate(invoiceData)),
  ]);

  await sendEmail({
    to: buyerUser.email,
    subject: `${EmailSubject.INVOICE_RECEIPT} (${invoiceNumber})`,
    html,
    attachments: [
      {
        filename: `${invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
};

const emailService = {
  sendEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
  sendOrderCreatedEmails,
  sendOrderStatusUpdatedEmail,
  sendAccountStatusEmail,
  sendOnlinePaymentInvoiceEmail,
};

export default emailService;
