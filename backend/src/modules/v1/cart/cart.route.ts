import { authenticate, authorize } from "@/middlewares/auth.middleware";
import validateRequest from "@/middlewares/validateRequest";
import cartController from "@/modules/v1/cart/cart.controller";
import {
  addToCartSchema,
  cartItemParamsSchema,
  updateCartItemSchema,
} from "@/modules/v1/cart/cart.validation";
import { UserRole } from "@/modules/v1/user/user.constant";
import express from "express";

const router = express.Router();

router.use(authenticate, authorize(UserRole.BUYER));

router.post(
  "/items",
  validateRequest(addToCartSchema, "body"),
  cartController.addToCart,
);

router.get("/", cartController.getCart);

router.patch(
  "/items/:itemId",
  validateRequest(cartItemParamsSchema, "params"),
  validateRequest(updateCartItemSchema, "body"),
  cartController.updateCartItem,
);

router.delete(
  "/items/:itemId",
  validateRequest(cartItemParamsSchema, "params"),
  cartController.removeCartItem,
);

export default router;
