import {
  authenticate,
  authorize,
  requireApprovedVendor,
} from "@/middlewares/auth.middleware";
import { uploadVendorImages } from "@/middlewares/upload.middleware";
import validateRequest from "@/middlewares/validateRequest";
import dashboardController from "@/modules/v1/dashboard/dashboard.controller";
import { vendorRecentSalesQuerySchema } from "@/modules/v1/dashboard/dashboard.validation";
import { UserRole } from "@/modules/v1/user/user.constant";
import vendorController from "@/modules/v1/vendor/vendor.controller";
import {
  updateVendorProfileSchema,
  updateVendorStatusSchema,
  vendorIdParamsSchema,
  vendorQuerySchema,
} from "./vendor.validation";
import express from "express";

const router = express.Router();

// Vendor Dashboard Overview & Recent Sales Aliases under /vendors/dashboard
router.get(
  "/dashboard/overview",
  authenticate,
  authorize(UserRole.VENDOR),
  requireApprovedVendor,
  dashboardController.getVendorDashboardOverview,
);

router.get(
  "/dashboard/recent-sales",
  authenticate,
  authorize(UserRole.VENDOR),
  requireApprovedVendor,
  validateRequest(vendorRecentSalesQuerySchema, "query"),
  dashboardController.getVendorRecentSales,
);

router.get(
  "/me",
  authenticate,
  authorize(UserRole.VENDOR),
  vendorController.getOwnProfile,
);

router.patch(
  "/me",
  authenticate,
  authorize(UserRole.VENDOR),
  uploadVendorImages,
  validateRequest(updateVendorProfileSchema, "body"),
  vendorController.updateOwnProfile,
);

router.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest(vendorQuerySchema, "query"),
  vendorController.getAllVendors,
);

router.get(
  "/statistics",
  authenticate,
  authorize(UserRole.ADMIN),
  vendorController.getVendorStatistics,
);

router.get(
  "/:vendorId",
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest(vendorIdParamsSchema, "params"),
  vendorController.getVendorById,
);

router.patch(
  "/:vendorId/status",
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest({
    params: vendorIdParamsSchema,
    body: updateVendorStatusSchema,
  }),
  vendorController.updateVendorStatus,
);

router.delete(
  "/:vendorId",
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest(vendorIdParamsSchema, "params"),
  vendorController.deleteVendorRequest,
);

export default router;
