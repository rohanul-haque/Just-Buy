import {
  authenticate,
  authorize,
  requireApprovedVendor,
} from "@/middlewares/auth.middleware";
import validateRequest from "@/middlewares/validateRequest";
import { UserRole } from "@/modules/v1/user/user.constant";
import express from "express";
import dashboardController from "./dashboard.controller";
import {
  recentUsersQuerySchema,
  userDetailsParamsSchema,
  vendorRecentSalesQuerySchema,
} from "./dashboard.validation";

const router = express.Router();

// ---------------- Vendor Dashboard Routes ----------------
router.get(
  "/vendor/overview",
  authenticate,
  authorize(UserRole.VENDOR),
  requireApprovedVendor,
  dashboardController.getVendorDashboardOverview,
);

router.get(
  "/vendor/recent-sales",
  authenticate,
  authorize(UserRole.VENDOR),
  requireApprovedVendor,
  validateRequest(vendorRecentSalesQuerySchema, "query"),
  dashboardController.getVendorRecentSales,
);

// ---------------- Admin Dashboard Routes ----------------
// All admin dashboard routes are strictly protected and accessible only by ADMIN
router.get(
  "/summary",
  authenticate,
  authorize(UserRole.ADMIN),
  dashboardController.getSummary,
);

router.get(
  "/monthly-earnings",
  authenticate,
  authorize(UserRole.ADMIN),
  dashboardController.getMonthlyEarnings,
);

router.get(
  "/order-distribution",
  authenticate,
  authorize(UserRole.ADMIN),
  dashboardController.getOrderDistribution,
);

router.get(
  "/recent-users",
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest(recentUsersQuerySchema, "query"),
  dashboardController.getRecentUsers,
);

router.get(
  "/users/:userId",
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest(userDetailsParamsSchema, "params"),
  dashboardController.getUserDetails,
);

export default router;
