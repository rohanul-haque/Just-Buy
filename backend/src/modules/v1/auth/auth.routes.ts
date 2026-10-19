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
import {
  forgotPasswordController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resetPasswordController,
} from "@/modules/v1/auth/auth.controller";

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
router.post("/register", validation(registerSchema), registerController);

/**
 * User Login Route
 * @access - public
 * @method - POST
 * @route - /api/v1/auth/login
 */
router.post("/login", validation(loginSchema), loginController);

/**
 * User Logout Route
 * @access - public
 * @method - GET
 * @route - /api/v1/auth/logout
 */
router.get("/logout", authenticate, logoutController);

/**
 * Refresh Token Route
 * @access - public
 * @method - POST
 * @route - /api/v1/auth/refresh-token
 */
router.post("/refresh-token", refreshTokenController);

/**
 * Forgot Password Route
 * @access - public
 * @method - POST
 * @route - /api/v1/auth/forgot-password
 */
router.post(
  "/forgot-password",
  validation(forgotPasswordSchema),
  forgotPasswordController,
);

/**
 * Reset Password Route
 * @access - public
 * @method - POST
 * @route - /api/v1/auth/reset-password
 */
router.post(
  "/reset-password",
  validation(resetPasswordSchema),
  resetPasswordController,
);

export default router;
