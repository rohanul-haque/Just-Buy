/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Module
 */
import { Router } from "express";

/**
 * Middlewares
 */
import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import validation from "@/middlewares/validation";
import fileUpload from "@/utils/fileUpload";

/**
 * Types
 */
import { UserRole } from "@/modules/v1/auth/auth.interface";

/**
 * Validation
 */
import {
  createProductSchema,
  getProductsQuerySchema,
  productIdSchema,
  updateProductSchema,
} from "@/modules/v1/product/product.validation";

/**
 * Controllers
 */
import productController from "@/modules/v1/product/product.controller";

/**
 * Router instance
 */
const router = Router();

/**
 * Create Product Route
 * @access - Private
 * @method - POST
 * @route - /api/v1/product
 */
router.post(
  "/",
  authenticate,
  authorize([UserRole.SELLER]),
  fileUpload.array("images", 5),
  validation(createProductSchema),
  productController.createProduct,
);

/**
 * Get All Products Route
 * @access - Public
 * @method - GET
 * @route - /api/v1/product/list
 */
router.get(
  "/list",
  validation(getProductsQuerySchema, "query"),
  productController.getAllProducts,
);

/**
 * Get Product By ID Route
 * @access - Public
 * @method - GET
 * @route - /api/v1/product/:id
 */
router.get(
  "/:id",
  validation(productIdSchema, "params"),
  productController.getProductById,
);

/**
 * Update Product Route
 * @access - Private
 * @method - PATCH
 * @route - /api/v1/product/:id
 */
router.patch(
  "/:id", 
  authenticate,
  authorize([UserRole.SELLER]),
  fileUpload.array("images"),
  validation(productIdSchema, "params"),
  validation(updateProductSchema),
  productController.updateProduct,
);

/**
 * Delete Product Route
 * @access - Private
 * @method - DELETE
 * @route - /api/v1/product/:id
 */
router.delete(
  "/:id",
  authenticate,
  authorize([UserRole.SELLER]),
  validation(productIdSchema, "params"),
  productController.deleteProduct,
);

/**
 * Export router
 */
export default router;
