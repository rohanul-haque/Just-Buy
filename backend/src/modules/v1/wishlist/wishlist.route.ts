import { authenticate, authorize } from "@/middlewares/auth.middleware";
import validateRequest from "@/middlewares/validateRequest";
import { UserRole } from "@/modules/v1/user/user.constant";
import wishlistController from "@/modules/v1/wishlist/wishlist.controller";
import {
  addWishlistItemSchema,
  productIdParamsSchema,
} from "@/modules/v1/wishlist/wishlist.validation";
import express from "express";

const router = express.Router();

router.use(authenticate, authorize(UserRole.BUYER));

router.post(
  "/items",
  validateRequest(addWishlistItemSchema, "body"),
  wishlistController.addItem,
);

router.get("/", wishlistController.getMyWishlist);

router.delete(
  "/items/:productId",
  validateRequest(productIdParamsSchema, "params"),
  wishlistController.removeItem,
);

export default router;
