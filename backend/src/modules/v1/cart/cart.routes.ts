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
import cartController from "@/modules/v1/cart/cart.controller";

/**
 * Type
 */
import { UserRole } from "@/modules/v1/auth/auth.interface";

/**
 * Validations
 */
import { addToCartSchema, IdSchema } from "./cart.validation";

/**
 * Router Instance
 */
const router = Router();

/**
 * Get Buyer's Cart
 * @access - Private
 * @method - GET
 * @route - /api/v1/cart
 */
router.get(
  "/list",
  authenticate,
  authorize([UserRole.BUYER]),
  cartController.getAllCarts,
);

/**
 * Add Product to Cart
 * @access - Private
 * @method - POST
 * @route - /api/v1/cart/:id
 */
router.post(
  "/:id",
  authenticate,
  authorize([UserRole.BUYER]),
  validation(IdSchema, "params"),
  validation(addToCartSchema, "body"),
  cartController.addToCart,
);

/**
 * Update Cart Item Quantity
 * @access - Private
 * @method - PUT
 * @route - /api/v1/cart/:id
 */
router.patch(
  "/:id",
  authenticate,
  authorize([UserRole.BUYER]),
  validation(IdSchema, "params"),
  validation(addToCartSchema, "body"),
  cartController.updateCartQuantity,
);

/**
 * Remove Product from Cart
 * @access - Private
 * @method - DELETE
 * @route - /api/v1/cart/:productId
 */
// router.delete(
//   "/:productId",
//   authenticate,
//   authorize([UserRole.BUYER]),
//   validation(productIdSchema, "params"),
//   removeFromCartController,
// );

export default router;
