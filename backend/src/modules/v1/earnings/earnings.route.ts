import {
  authenticate,
  authorize,
  requireApprovedVendor,
} from "@/middlewares/auth.middleware";
import validateRequest from "@/middlewares/validateRequest";
import { UserRole } from "@/modules/v1/user/user.constant";
import earningsController from "./earnings.controller";
import {
  earningsOrderIdSchema,
  earningsQuerySchema,
} from "./earnings.validation";
import express from "express";

const router = express.Router();

// ---------------- Vendor Earnings Routes ----------------
router.get(
  "/vendor/summary",
  authenticate,
  authorize(UserRole.VENDOR),
  requireApprovedVendor,
  earningsController.getVendorEarningsSummary,
);

router.get(
  "/vendor",
  authenticate,
  authorize(UserRole.VENDOR),
  requireApprovedVendor,
  validateRequest(earningsQuerySchema, "query"),
  earningsController.getVendorEarningsTransactions,
);

router.get(
  "/vendor/:orderId",
  authenticate,
  authorize(UserRole.VENDOR),
  requireApprovedVendor,
  validateRequest(earningsOrderIdSchema, "params"),
  earningsController.getVendorEarningsTransactionDetails,
);

// ---------------- Admin Earnings Routes ----------------
// All admin earnings routes are strictly protected and accessible only by ADMIN
router.get(
  "/summary",
  authenticate,
  authorize(UserRole.ADMIN),
  earningsController.getEarningsSummary,
);

router.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest(earningsQuerySchema, "query"),
  earningsController.getEarningsTransactions,
);

router.get(
  "/:orderId",
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest(earningsOrderIdSchema, "params"),
  earningsController.getEarningsTransactionDetails,
);

export default router;
