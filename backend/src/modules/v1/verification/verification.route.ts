import {
  verificationSendRateLimiter,
  verificationVerifyRateLimiter,
} from "@/middlewares/rate-limiter.middleware";
import validateRequest from "@/middlewares/validateRequest";
import verificationController from "@/modules/v1/verification/verification.controller";
import {
  resendOtpSchema,
  verifyOtpSchema,
} from "@/modules/v1/verification/verification.validation";
import express from "express";

const router = express.Router();

router.post(
  "/verify-otp",
  verificationVerifyRateLimiter,
  validateRequest(verifyOtpSchema, "body"),
  verificationController.verifyOtp,
);

router.post(
  "/resend-otp",
  verificationSendRateLimiter,
  validateRequest(resendOtpSchema, "body"),
  verificationController.resendOtp,
);

export default router;
