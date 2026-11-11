import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { upload } from "@/middlewares/upload.middleware";
import validateRequest from "@/middlewares/validateRequest";
import buyerController from "@/modules/v1/buyer/buyer.controller";
import {
  buyerIdParamsSchema,
  buyerQuerySchema,
  updateBuyerProfileSchema,
  updateBuyerStatusSchema,
} from "@/modules/v1/buyer/buyer.validation";
import { UserRole } from "@/modules/v1/user/user.constant";
import express from "express";

const router = express.Router();

router.get(
  "/me",
  authenticate,
  authorize(UserRole.BUYER),
  buyerController.getOwnProfile,
);

router.patch(
  "/me",
  authenticate,
  authorize(UserRole.BUYER),
  upload.single("profile"),
  validateRequest(updateBuyerProfileSchema, "body"),
  buyerController.updateOwnProfile,
);

router.delete(
  "/me",
  authenticate,
  authorize(UserRole.BUYER),
  buyerController.deleteOwnAccount,
);

router.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.VENDOR),
  validateRequest(buyerQuerySchema, "query"),
  buyerController.getAllBuyers,
);

router.get(
  "/:buyerId",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.VENDOR),
  validateRequest(buyerIdParamsSchema, "params"),
  buyerController.getBuyerById,
);

router.patch(
  "/:buyerId/status",
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest({
    params: buyerIdParamsSchema,
    body: updateBuyerStatusSchema,
  }),
  buyerController.updateBuyerStatus,
);

export default router;
