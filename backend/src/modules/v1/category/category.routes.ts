/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Modules
 */
import { Router } from "express";

/**
 * Application Modules - Middlewares
 */
import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import validation from "@/middlewares/validation";
import fileUpload from "@/utils/fileUpload";

/**
 * Type
 */
import { UserRole } from "@/modules/v1/auth/auth.interface";

/**
 * Validations
 */
import {
  categoryListQuerySchema,
  createCategorySchema,
  idSchema,
  updateCategorySchema,
} from "@/modules/v1/category/category.validation";

/**
 * API Controllers
 */
import categoryController from "@/modules/v1/category/category.controller";

/**
 * Router Instance
 */
const router = Router();

/**
 * Create Category
 * @access Private
 * @method POST
 * @route /api/v1/category
 */
router.post(
  "/",
  authenticate,
  authorize([UserRole.ADMIN]),
  fileUpload.single("image"),
  validation(createCategorySchema, "body"),
  categoryController.createCategory,
);

/**
 * Get All Categories
 * @access Public
 * @method GET
 * @route /api/v1/category/list
 */
router.get(
  "/list",
  validation(categoryListQuerySchema, "query"),
  categoryController.getAllCategories,
);

/**
 * Get Category by ID
 * @access Public
 * @method GET
 * @route /api/v1/category/:categoryId
 */
router.get(
  "/:id",
  validation(idSchema, "params"),
  categoryController.getCategoryById,
);

/**
 * Update Category
 * @access Private (Admin)
 * @method PATCH
 * @route /api/v1/category/:id
 */
router.patch(
  "/:id",
  authenticate,
  authorize([UserRole.ADMIN]),
  fileUpload.single("image"),
  validation(idSchema, "params"),
  validation(updateCategorySchema, "body"),
  categoryController.updateCategory,
);

/**
 * Delete Category
 * @access Private (Admin)
 * @method DELETE
 * @route /api/v1/category/:id
 */
router.delete(
  "/:id",
  authenticate,
  authorize([UserRole.ADMIN]),
  validation(idSchema, "params"),
  categoryController.deleteCategory,
);

/**
 * Export Router
 */
export default router;
