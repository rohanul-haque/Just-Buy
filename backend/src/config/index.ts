/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Modules
 */
import dotenv from "dotenv";
import path from "path";
import ms from "ms";
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });

/**
 * Application Configurations
 */
const config = {
  PORT: process.env.PORT || "5000",
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017",

  NODE_ENV: process.env.NODE_ENV || "development",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",

  WHITELISTED_ORIGINS: ["http://localhost:3000", ""],
  WHITELISTED_ADMIN_MAILS: [
    "dev.rohan2024@gmail.com",
    "mdrohanulhaquerohan368@gmail.com",
    "codeithfardin@gmail.com",
  ],
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  CLIENT_URL:
    process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:3000",

  JWT_ACCESS_SECRET:
    process.env.JWT_ACCESS_SECRET || "default_jwt_access_secret_jus_buy",
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || "default_jwt_refresh_secret_jus_buy",

  ACCESS_TOKEN_EXPIRY: (process.env.ACCESS_TOKEN_EXPIRY ||
    "1h") as ms.StringValue,
  REFRESH_TOKEN_EXPIRY: (process.env.REFRESH_TOKEN_EXPIRY ||
    "30d") as ms.StringValue,
  JWT_ACCESS_EXPIRES_IN: (process.env.JWT_ACCESS_EXPIRES_IN ||
    process.env.ACCESS_TOKEN_EXPIRY ||
    "1h") as ms.StringValue,
  JWT_REFRESH_EXPIRES_IN: (process.env.JWT_REFRESH_EXPIRES_IN ||
    process.env.REFRESH_TOKEN_EXPIRY ||
    "30d") as ms.StringValue,

  EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
  EMAIL_PORT: Number(process.env.EMAIL_PORT) || 465,
  EMAIL_SECURE: process.env.EMAIL_SECURE !== "false",
  EMAIL_USER: process.env.EMAIL_USER || process.env.SMTP_USER || "",
  EMAIL_PASS:
    process.env.EMAIL_PASS ||
    process.env.EMAIL_PASSWORD ||
    process.env.SMTP_PASS ||
    "",
  EMAIL_PASSWORD:
    process.env.EMAIL_PASSWORD ||
    process.env.SMTP_PASS ||
    process.env.EMAIL_PASS ||
    "",
  EMAIL_FROM:
    process.env.EMAIL_FROM ||
    process.env.EMAIL_SENDER ||
    process.env.SMTP_USER ||
    "",

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  IMAGE_MAX_SIZE: Number(process.env.IMAGE_MAX_SIZE) || 5242880,

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
    ? process.env.STRIPE_WEBHOOK_SECRET.startsWith("hsec_")
      ? `w${process.env.STRIPE_WEBHOOK_SECRET}`
      : process.env.STRIPE_WEBHOOK_SECRET
    : undefined,
  STRIPE_CURRENCY: (process.env.STRIPE_CURRENCY || "usd").toLowerCase(),
  STRIPE_SUCCESS_URL:
    process.env.STRIPE_SUCCESS_URL ||
    `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment/success`,
  STRIPE_CANCEL_URL:
    process.env.STRIPE_CANCEL_URL ||
    `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment/cancel`,

  DEFAULT_LIMIT: 15,
  DEFAULT_OFFSET: 0,

  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: process.env.REDIS_PORT || "6379",
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || "",
  REDIS_USER: process.env.REDIS_USER || "default",

  SMTP_USER: process.env.SMTP_USER || process.env.EMAIL_USER || "",
  SMTP_PASS:
    process.env.SMTP_PASS ||
    process.env.EMAIL_PASSWORD ||
    process.env.EMAIL_PASS ||
    "",
  EMAIL_SENDER: process.env.EMAIL_SENDER || process.env.EMAIL_FROM || "",

  OTP_LENGTH: Number(process.env.OTP_LENGTH) || 5,
  OTP_EXPIRES_IN: Number(process.env.OTP_EXPIRES_IN) || 300,
  OTP_RESEND_COOLDOWN: Number(process.env.OTP_RESEND_COOLDOWN) || 60,
  OTP_MAX_ATTEMPTS: Number(process.env.OTP_MAX_ATTEMPTS) || 5,

  PASSWORD_RESET_EXPIRES_IN:
    Number(process.env.PASSWORD_RESET_EXPIRES_IN) || 900,

  LOGIN_MAX_ATTEMPTS: Number(process.env.LOGIN_MAX_ATTEMPTS) || 5,
  LOGIN_RATE_LIMIT_WINDOW: Number(process.env.LOGIN_RATE_LIMIT_WINDOW) || 900,
  LOGIN_LOCKOUT_DURATION: Number(process.env.LOGIN_LOCKOUT_DURATION) || 900,

  REGISTER_MAX_ATTEMPTS: Number(process.env.REGISTER_MAX_ATTEMPTS) || 5,
  REGISTER_RATE_LIMIT_WINDOW:
    Number(process.env.REGISTER_RATE_LIMIT_WINDOW) || 900,

  BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
};

export default config;
