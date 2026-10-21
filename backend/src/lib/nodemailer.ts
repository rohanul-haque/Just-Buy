/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Module
 */
import nodemailer from "nodemailer";

/**
 * Application Module
 */
import config from "@/config";

/**
 * Nodemailer Transporter Configuration
 */
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});
