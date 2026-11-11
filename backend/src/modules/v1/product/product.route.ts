import {
  authenticate,
  authorize,
  requireApprovedVendor,
} from "@/middlewares/auth.middleware";
import { uploadProductImages } from "@/middlewares/upload.middleware";
import validateRequest from "@/middlewares/validateRequest";
import productController from "@/modules/v1/product/product.controller";
import {
  createProductSchema,
  productIdParamsSchema,
  productQuerySchema,
  updateProductSchema,
} from "@/modules/v1/product/product.validation";
import reviewController from "@/modules/v1/review/review.controller";
import { UserRole } from "@/modules/v1/user/user.constant";
import express from "express";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize(UserRole.VENDOR),
  requireApprovedVendor,
  uploadProductImages,
  validateRequest(createProductSchema, "body"),
  productController.createProduct,
);

router.get(
  "/my-products",
  authenticate,
  authorize(UserRole.VENDOR),
  requireApprovedVendor,
  validateRequest(productQuerySchema, "query"),
  productController.getMyProducts,
);

router.patch(
  "/my-products/:productId",
  authenticate,
  authorize(UserRole.VENDOR),
  requireApprovedVendor,
  uploadProductImages,
  validateRequest({
    params: productIdParamsSchema,
    body: updateProductSchema,
  }),
  productController.updateMyProduct,
);

router.delete(
  "/my-products/:productId",
  authenticate,
  authorize(UserRole.VENDOR),
  requireApprovedVendor,
  validateRequest(productIdParamsSchema, "params"),
  productController.deleteMyProduct,
);

router.get(
  "/",
  validateRequest(productQuerySchema, "query"),
  productController.getPublicProducts,
);

router.get("/new-arrivals", productController.getNewArrivals);

router.get(
  "/:productId",
  validateRequest(productIdParamsSchema, "params"),
  productController.getProductById,
);

router.get(
  "/:productId/related",
  validateRequest(productIdParamsSchema, "params"),
  productController.getRelatedProducts,
);

router.get(
  "/:productId/reviews",
  validateRequest(productIdParamsSchema, "params"),
  reviewController.getProductReviews,
);

export default router;
