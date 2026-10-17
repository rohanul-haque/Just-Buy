/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Modules
 */
import { Router } from "express";

/**
 * Middlewares
 */
import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";

/**
 * API Controllers
 */
import { createOrderController } from "@/modules/v1/order/order.controller";

/**
 * Type
 */
import { UserRole } from "@/modules/v1/auth/auth.intarface";

/**
 * Validations
 */
import { createOrderSchema } from "@/modules/v1/order/order.validation";
import validation from "@/middlewares/validation";

/**
 * Router Instance
 */
const router = Router();

/**
 * Create Order
 * @access - Private
 * @method - POST
 * @route - /api/v1/order
 */
router.post(
  "/",
  authenticate,
  authorize([UserRole.BUYER]),
  validation(createOrderSchema, "body"),
  createOrderController,
);

export default router;
