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
 * Type
 */
import { UserRole } from "@/modules/v1/auth/auth.intarface";

/**
 * Validation
 */
import { productIdSchema } from "@/modules/v1/product/product.validation";

/**
 * API Controllers
 */
import {
  addWishlistController,
  removeWishlistController,
} from "@/modules/v1/wishlist/wishlist.controller";

/**
 * Router instance
 */
const router = Router();

/**
 * Add Wishlist
 * @access - Private
 * @method - POST
 * @route - /api/v1/wishlist/:productId
 */
router.post(
  "/:productId",
  authenticate,
  authorize([UserRole.BUYER]),
  validation(productIdSchema, "params"),
  addWishlistController,
);

/**
 * Get All Wishlist
 * @access - Private
 * @method - GET
 * @route - /api/v1/wishlist/list
 */
router.delete(
  "/:productId",
  authenticate,
  authorize([UserRole.BUYER]),
  validation(productIdSchema, "params"),
  removeWishlistController,
);

export default router;
