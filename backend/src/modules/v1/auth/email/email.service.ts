import config from "@/config";
import { logger } from "@/lib/winston";
import { EmailSubject } from "@/modules/v1/auth/email/email.constant";
import type { ISendEmailOptions } from "@/modules/v1/auth/email/email.interface";
import emailTransporter from "@/modules/v1/auth/email/email.transporter";
import { renderPasswordResetSuccessTemplate } from "@/modules/v1/auth/email/templates/password-reset-success.template";
import { renderPasswordResetTemplate } from "@/modules/v1/auth/email/templates/password-reset.template";
import { renderVerificationTemplate } from "@/modules/v1/auth/email/templates/verification.template";
import { renderWelcomeAdminTemplate } from "@/modules/v1/auth/email/templates/welcome-admin.template";
import { renderWelcomeBuyerTemplate } from "@/modules/v1/auth/email/templates/welcome-buyer.template";
import { renderWelcomeVendorTemplate } from "@/modules/v1/auth/email/templates/welcome-vendor.template";

const sendEmail = async (options: ISendEmailOptions): Promise<void> => {
  const { to, subject, html, text } = options;

  try {
    await emailTransporter.sendMail({
      from: `"${config.EMAIL_FROM || "Jus Buy"}" <${config.EMAIL_USER}>`,
      to,
      subject,
      html,
      ...(text && { text }),
    });

    logger.info("Authentication email sent successfully", {
      to,
      subject,
    });
  } catch (error) {
    logger.error("Failed to send authentication email:", {
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

const emailService = {
  sendEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
};

export default emailService;
