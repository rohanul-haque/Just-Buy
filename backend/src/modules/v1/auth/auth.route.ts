import {
  authenticate,
  optionalAuthenticate,
} from "@/middlewares/auth.middleware";
import {
  loginRateLimiter,
  registrationRateLimiter,
} from "@/middlewares/rate-limiter.middleware";
import validateRequest from "@/middlewares/validateRequest";
import authController from "@/modules/v1/auth/auth.controller";
import {
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/modules/v1/auth/auth.validation";
import express from "express";

const router = express.Router();

router.post(
  "/register",
  registrationRateLimiter,
  validateRequest(registerSchema, "body"),
  authController.register,
);

router.post(
  "/login",
  loginRateLimiter,
  validateRequest(loginSchema, "body"),
  authController.login,
);

router.get("/me", authenticate, authController.getMe);

router.post("/logout", optionalAuthenticate, authController.logout);

router.post(
  "/refresh-token",
  validateRequest(refreshTokenSchema, "body"),
  authController.refreshToken,
);

router.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema, "body"),
  authController.forgotPassword,
);

router.post(
  "/reset-password",
  validateRequest(resetPasswordSchema, "body"),
  authController.resetPassword,
);

export default router;
