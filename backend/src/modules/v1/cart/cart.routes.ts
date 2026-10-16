/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
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

/**
 * API Controllers
 */
import { addToCartController } from "@/modules/v1/cart/cart.controller";

/**
 * Type
 */
import { UserRole } from "@/modules/v1/auth/auth.intarface";

/**
 * Validations
 */
import { productIdSchema } from "@/modules/v1/product/product.validation";
import { addToCartSchema } from "./cart.validation";

/**
 * Router Instance
 */
const router = Router();

/**
 * Add Product to Cart
 * @access - Private
 * @method - POST
 * @route - /api/v1/cart/:productId
 */
router.post(
  "/:productId",
  authenticate,
  authorize([UserRole.BUYER]),
  validation(productIdSchema, "params"),
  validation(addToCartSchema, "body"),
  addToCartController,
);

export default router;
