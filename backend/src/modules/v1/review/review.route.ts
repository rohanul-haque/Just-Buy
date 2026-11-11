import { authenticate, authorize } from "@/middlewares/auth.middleware";
import validateRequest from "@/middlewares/validateRequest";
import reviewController from "@/modules/v1/review/review.controller";
import {
  createReviewSchema,
  productIdParamsSchema,
} from "@/modules/v1/review/review.validation";
import { UserRole } from "@/modules/v1/user/user.constant";
import express from "express";

const router = express.Router();

/**
 * POST /api/v1/reviews
 * Buyer only - Create a review for a delivered product
 */
router.post(
  "/",
  authenticate,
  authorize(UserRole.BUYER),
  validateRequest(createReviewSchema, "body"),
  reviewController.createReview,
);

router.get(
  "/products/:productId/reviews",
  validateRequest(productIdParamsSchema, "params"),
  reviewController.getProductReviews,
);

router.get(
  "/:productId",
  validateRequest(productIdParamsSchema, "params"),
  reviewController.getProductReviews,
);

export default router;
