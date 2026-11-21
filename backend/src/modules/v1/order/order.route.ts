import {
  authenticate,
  authorize,
  requireApprovedVendor,
} from "@/middlewares/auth.middleware";
import validateRequest from "@/middlewares/validateRequest";
import orderController from "@/modules/v1/order/order.controller";
import {
  createOrderSchema,
  orderIdParamsSchema,
  orderQuerySchema,
  updateOrderStatusSchema,
} from "@/modules/v1/order/order.validation";
import { UserRole } from "@/modules/v1/user/user.constant";
import express from "express";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize(UserRole.BUYER),
  validateRequest(createOrderSchema, "body"),
  orderController.createOrder,
);

router.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest(orderQuerySchema, "query"),
  orderController.getAllOrders,
);

router.get(
  "/my-orders",
  authenticate,
  authorize(UserRole.BUYER),
  validateRequest(orderQuerySchema, "query"),
  orderController.getMyOrders,
);

router.get(
  "/vendor/orders",
  authenticate,
  authorize(UserRole.VENDOR),
  requireApprovedVendor,
  validateRequest(orderQuerySchema, "query"),
  orderController.getVendorOrders,
);

router.get(
  "/:orderId",
  authenticate,
  authorize(UserRole.BUYER, UserRole.VENDOR, UserRole.ADMIN),
  validateRequest(orderIdParamsSchema, "params"),
  orderController.getOrderById,
);

router.patch(
  "/:orderId/cancel",
  authenticate,
  authorize(UserRole.BUYER),
  validateRequest(orderIdParamsSchema, "params"),
  orderController.cancelOrder,
);

router.patch(
  "/:orderId/status",
  authenticate,
  authorize(UserRole.VENDOR),
  validateRequest(orderIdParamsSchema, "params"),
  validateRequest(updateOrderStatusSchema, "body"),
  orderController.updateOrderStatus,
);

router.patch(
  "/:orderId/confirm-cod-payment",
  authenticate,
  authorize(UserRole.VENDOR, UserRole.ADMIN),
  validateRequest(orderIdParamsSchema, "params"),
  orderController.confirmCODPayment,
);

router.patch(
  "/:orderId/payment/confirm-cod",
  authenticate,
  authorize(UserRole.VENDOR, UserRole.ADMIN),
  validateRequest(orderIdParamsSchema, "params"),
  orderController.confirmCODPayment,
);

export default router;
