import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { upload } from "@/middlewares/upload.middleware";
import validateRequest from "@/middlewares/validateRequest";
import adminController from "@/modules/v1/admin/admin.controller";
import { updateAdminProfileSchema } from "@/modules/v1/admin/admin.validation";
import { UserRole } from "@/modules/v1/user/user.constant";
import express from "express";

const router = express.Router();

router.get(
  "/me",
  authenticate,
  authorize(UserRole.ADMIN),
  adminController.getAdminProfile,
);

router.patch(
  "/me",
  authenticate,
  authorize(UserRole.ADMIN),
  upload.single("profile"),
  validateRequest(updateAdminProfileSchema, "body"),
  adminController.updateAdminProfile,
);

export default router;
