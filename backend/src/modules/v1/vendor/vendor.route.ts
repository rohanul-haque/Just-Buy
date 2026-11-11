import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { uploadVendorImages } from "@/middlewares/upload.middleware";
import validateRequest from "@/middlewares/validateRequest";
import { UserRole } from "@/modules/v1/user/user.constant";
import vendorController from "@/modules/v1/vendor/vendor.controller";
import {
  updateVendorProfileSchema,
  updateVendorStatusSchema,
  vendorIdParamsSchema,
  vendorQuerySchema,
} from "@/modules/v1/vendor/vendor.validation";
import express from "express";

const router = express.Router();

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

export default router;
