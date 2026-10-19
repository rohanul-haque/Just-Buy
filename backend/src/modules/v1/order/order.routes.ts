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
import {
  createOrderController,
  updateOrderStatusController,
} from "@/modules/v1/order/order.controller";

/**
 * Type
 */
import { UserRole } from "@/modules/v1/auth/auth.intarface";

/**
 * Validations
 */
import validation from "@/middlewares/validation";
import {
  createOrderSchema,
  orderIdSchema,
  updateOrderStatusSchema,
} from "@/modules/v1/order/order.validation";

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

/**
 * Update Order Status
 * @access - Private
 * @method - PATCH
 * @route - /api/v1/order/:orderId/status
 */
router.patch(
  "/:orderId/status",
  authenticate,
  authorize([UserRole.SELLER]),
  validation(orderIdSchema, "params"),
  validation(updateOrderStatusSchema, "body"),
  updateOrderStatusController,
);

export default router;
