/**
 * @copyright 2026
 * @author Rohanul Hauqe Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Module
 */
import { Router } from "express";

/**
 * Application Module
 */
import fileUpload from "@/utils/fileUpload";

/**
 * Middlewares
 */
import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import validation from "@/middlewares/validation";

/**
 * API Controllers
 */
import {
  deleteSellerProfileController,
  getAllSellerProfileController,
  getCurrentSellerProfileController,
  getSellerProfileByIdController,
  updateSellerController,
} from "@/modules/v1/seller/seller.controller";

/**
 * Validations
 */
import {
  sellerListQuerySchema,
  updateSellerSchema,
  userIdSchema,
} from "@/modules/v1/seller/seller.validation";
import { UserRole } from "../auth/auth.intarface";

/**
 * Router Instance
 */
const router = Router();

/**
 * Get Current Seller Profile
 * @access - Private
 * @method - GET
 * @route - /api/v1/seller/current
 */
router.get(
  "/current",
  authenticate,
  authorize([UserRole.SELLER]),
  getCurrentSellerProfileController,
);

/**
 * Get All Seller Profiles
 * @access - Private
 * @method - GET
 * @route - /api/v1/seller/list
 */
router.get(
  "/list",
  authenticate,
  authorize([UserRole.ADMIN]),
  validation(sellerListQuerySchema, "query"),
  getAllSellerProfileController,
);

/**
 * Update Current Seller Profile
 * @access - Private
 * @method - PATCH
 * @route - /api/v1/seller/current
 */
router.patch(
  "/current",
  authenticate,
  authorize([UserRole.SELLER]),
  fileUpload.single("avatar"),
  validation(updateSellerSchema),
  updateSellerController,
);

/**
 * Get Seller Profile By ID
 * @access - Private
 * @method - GET
 * @route - /api/v1/seller/:userId
 */
router.get(
  "/:userId",
  authenticate,
  authorize([UserRole.SELLER, UserRole.ADMIN]),
  validation(userIdSchema, "params"),
  getSellerProfileByIdController,
);

/**
 * Delete Seller Profile By ID
 * @access - Private
 * @method - DELETE
 * @route - /api/v1/seller/:userId
 */
router.delete(
  "/:userId",
  authenticate,
  authorize([UserRole.SELLER, UserRole.ADMIN]),
  validation(userIdSchema, "params"),
  deleteSellerProfileController,
);

export default router;
