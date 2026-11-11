import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { upload } from "@/middlewares/upload.middleware";
import validateRequest from "@/middlewares/validateRequest";
import categoryController from "@/modules/v1/category/category.controller";
import {
  categoryIdParamsSchema,
  categoryQuerySchema,
  createCategorySchema,
  updateCategorySchema,
  updateCategoryStatusSchema,
} from "@/modules/v1/category/category.validation";
import { UserRole } from "@/modules/v1/user/user.constant";
import express from "express";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  upload.single("image"),
  validateRequest(createCategorySchema, "body"),
  categoryController.createCategory,
);

router.get(
  "/",
  validateRequest(categoryQuerySchema, "query"),
  categoryController.getAllCategories,
);

router.get(
  "/:categoryId",
  validateRequest(categoryIdParamsSchema, "params"),
  categoryController.getCategoryById,
);

router.patch(
  "/:categoryId",
  authenticate,
  authorize(UserRole.ADMIN),
  upload.single("image"),
  validateRequest({
    params: categoryIdParamsSchema,
    body: updateCategorySchema,
  }),
  categoryController.updateCategory,
);

router.patch(
  "/:categoryId/status",
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest({
    params: categoryIdParamsSchema,
    body: updateCategoryStatusSchema,
  }),
  categoryController.updateCategoryStatus,
);

router.delete(
  "/:categoryId",
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest(categoryIdParamsSchema, "params"),
  categoryController.deleteCategory,
);

export default router;
