/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Module
 */
import { Router } from "express";

/**
 * Middlewares
 */
import authenticate from "@/middlewares/authenticate";
import validation from "@/middlewares/validation";

/**
 * API Controllers
 */
import authController from "@/modules/v1/auth/auth.controller";

/**
 * Validations
 */
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/modules/v1/auth/auth.validation";

/**
 * Router Instance
 */
const router = Router();

/**
 * User Registration Route
 * @access - public
 * @method - POST
 * @route - /api/v1/auth/register
 */
router.post(
  "/register",
  validation(registerSchema, "body"),
  authController.register,
);

/**
 * User Login Route
 * @access - public
 * @method - POST
 * @route - /api/v1/auth/login
 */
router.post("/login", validation(loginSchema, "body"), authController.login);

/**
 * Refresh Token Route
 * @access - public
 * @method - POST
 * @route - /api/v1/auth/refresh-token
 */
router.post("/refresh-token", authController.refreshToken);

/**
 * User Logout Route
 * @access - private
 * @method - GET
 * @route - /api/v1/auth/logout
 */
router.get("/logout", authenticate, authController.logout);

/**
 * Forgot Password Route
 * @access - public
 * @method - POST
 * @route - /api/v1/auth/forgot-password
 */
router.post(
  "/forgot-password",
  validation(forgotPasswordSchema, "body"),
  authController.forgotPassword,
);

/**
 * Reset Password Route
 * @access - public
 * @method - PATCH
 * @route - /api/v1/auth/reset-password
 */
router.patch(
  "/reset-password",
  validation(resetPasswordSchema, "body"),
  authController.resetPassword,
);

/**
 * Export auth routes
 */
export default router;
