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
 * Roles & Types
 */
import { UserRole } from "@/modules/v1/auth/auth.intarface";

/**
 * Validations
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
import {
  createProductController,
  deleteProductController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
} from "@/modules/v1/product/product.controller";

/**
 * Router instance
 */
const router = Router();

/**
 * Create Product (Add product)
 * @access - Private (Seller, Admin)
 * @method - POST
 * @route - /api/v1/product
 */
router.post(
  "/",
  authenticate,
  authorize([UserRole.SELLER]),
  fileUpload.array("images"),
  validation(createProductSchema),
  createProductController,
);

/**
 * Get All Products (Product list)
 * @access - Public
 * @method - GET
 * @route - /api/v1/product/list
 */
router.get(
  "/list",
  validation(getProductsQuerySchema, "query"),
  getAllProductsController,
);

/**
 * Get Product By ID (Product details)
 * @access - Public
 * @method - GET
 * @route - /api/v1/product/:id
 */
router.get(
  "/:productId",
  validation(productIdSchema, "params"),
  getProductByIdController,
);

/**
 * Update Product
 * @access - Private (Seller, Admin)
 * @method - PATCH
 * @route - /api/v1/product/:id
 */
router.patch(
  "/:productId",
  authenticate,
  authorize([UserRole.SELLER, UserRole.ADMIN]),
  fileUpload.array("images"),
  validation(productIdSchema, "params"),
  validation(updateProductSchema),
  updateProductController,
);

/**
 * Delete Product
 * @access - Private (Seller, Admin)
 * @method - DELETE
 * @route - /api/v1/product/:id
 */
router.delete(
  "/:productId",
  authenticate,
  authorize([UserRole.SELLER]),
  validation(productIdSchema, "params"),
  deleteProductController,
);

/**
 * Export router
 */
export default router;
