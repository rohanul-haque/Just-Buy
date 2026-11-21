import { authenticate, authorize } from "@/middlewares/auth.middleware";
import validateRequest from "@/middlewares/validateRequest";
import paymentController from "@/modules/v1/payment/payment.controller";
import {
  orderIdParamsSchema,
  sessionIdParamsSchema,
  sessionIdQuerySchema,
} from "@/modules/v1/payment/payment.validation";
import { UserRole } from "@/modules/v1/user/user.constant";
import express from "express";

const router = express.Router();

// Stripe Webhook Endpoint (raw body parsed in app.ts before express.json)
router.post("/stripe/webhook", paymentController.handleStripeWebhook);

// Protected Buyer Payment verification by Stripe Checkout Session ID
router.get(
  "/verify-session/:sessionId",
  authenticate,
  authorize(UserRole.BUYER),
  validateRequest(sessionIdParamsSchema, "params"),
  paymentController.verifyStripeSession,
);

router.get(
  "/verify-session",
  authenticate,
  authorize(UserRole.BUYER),
  validateRequest(sessionIdQuerySchema, "query"),
  paymentController.verifyStripeSession,
);

// Protected Buyer Payment details lookup
router.get(
  "/order/:orderId",
  authenticate,
  authorize(UserRole.BUYER),
  validateRequest(orderIdParamsSchema, "params"),
  paymentController.getPaymentByOrderId,
);

router.patch(
  "/order/:orderId/confirm-cod",
  authenticate,
  authorize(UserRole.VENDOR),
  validateRequest(orderIdParamsSchema, "params"),
  paymentController.confirmCODPayment,
);

export default router;
