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
import { UserRole } from "@/modules/v1/auth/auth.interface";

/**
 * Validation
 */
import {
  idSchema,
  wishListQuerySchema,
} from "@/modules/v1/wishlist/wishlist.validation";

/**
 * API Controllers
 */
import wishlistController from "@/modules/v1/wishlist/wishlist.controller";

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
  "/:id",
  authenticate,
  authorize([UserRole.BUYER]),
  validation(idSchema, "params"),
  wishlistController.addWishlist,
);

/**
 * Add Wishlist
 * @access - Private
 * @method - POST
 * @route - /api/v1/wishlist/:productId
 */
router.get(
  "/list",
  authenticate,
  authorize([UserRole.BUYER]),
  validation(wishListQuerySchema, "query"),
  wishlistController.allWishlist,
);

/**
 * Get All Wishlist
 * @access - Private
 * @method - GET
 * @route - /api/v1/wishlist/list
 */
router.delete(
  "/:id",
  authenticate,
  authorize([UserRole.BUYER]),
  validation(idSchema, "params"),
  wishlistController.removeWishlist,
);

export default router;
