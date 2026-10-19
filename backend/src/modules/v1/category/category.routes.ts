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
 * Application Modules - Types
 */
import { UserRole } from "@/modules/v1/auth/auth.intarface";

/**
 * Application Modules - Validations
 */
import {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from "@/modules/v1/category/category.validation";

/**
 * Application Modules - Controllers
 */
import {
  createCategoryController,
  deleteCategoryController,
  getAllCategoriesController,
  getCategoryByIdController,
  updateCategoryController,
} from "@/modules/v1/category/category.controller";

/**
 * Router Instance
 */
const router = Router();

/**
 * Create Category
 * @access Private (Admin)
 * @method POST
 * @route /api/v1/category
 */
router.post(
  "/",
  authenticate,
  authorize([UserRole.ADMIN]),
  fileUpload.single("image"),
  validation(createCategorySchema, "body"),
  createCategoryController,
);

/**
 * Get All Categories
 * @access Public
 * @method GET
 * @route /api/v1/category/list
 */
router.get("/list", getAllCategoriesController);

/**
 * Get Category by ID
 * @access Public
 * @method GET
 * @route /api/v1/category/:categoryId
 */
router.get(
  "/:categoryId",
  validation(categoryIdSchema, "params"),
  getCategoryByIdController,
);

/**
 * Update Category
 * @access Private (Admin)
 * @method PATCH
 * @route /api/v1/category/:id
 */
router.patch(
  "/:categoryId",
  authenticate,
  authorize([UserRole.ADMIN]),
  fileUpload.single("image"),
  validation(categoryIdSchema, "params"),
  validation(updateCategorySchema, "body"),
  updateCategoryController,
);

/**
 * Delete Category
 * @access Private (Admin)
 * @method DELETE
 * @route /api/v1/category/:id
 */
router.delete(
  "/:categoryId",
  authenticate,
  authorize([UserRole.ADMIN]),
  validation(categoryIdSchema, "params"),
  deleteCategoryController,
);

/**
 * Export Router
 */
export default router;
