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
  deleteBuyerProfileController,
  getAllBuyerProfileController,
  getBuyerProfileByIdController,
  getCurrentBuyerProfileController,
  updateBuyerProfileController,
} from "@/modules/v1/buyer/buyer.controller";

/**
 * Interfaces
 */
import { UserRole } from "@/modules/v1/auth/auth.intarface";

/**
 * Validations
 */
import {
  buyerListQuerySchema,
  updateBuyerSchema,
  userIdSchema,
} from "@/modules/v1/buyer/buyer.validation";

/**
 * Router Instance
 */
const router = Router();

/**
 * Get Current Buyer Profile
 * @access - Private
 * @method - GET
 * @route - /api/v1/buyer/current
 */
router.get(
  "/current",
  authenticate,
  authorize([UserRole.BUYER]),
  getCurrentBuyerProfileController,
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
  validation(buyerListQuerySchema, "query"),
  getAllBuyerProfileController,
);

/**
 * Update Current Buyer Profile
 * @access - Private
 * @method - PATCH
 * @route - /api/v1/buyer/current
 */
router.patch(
  "/current",
  authenticate,
  authorize([UserRole.BUYER]),
  fileUpload.single("avatar"),
  validation(updateBuyerSchema),
  updateBuyerProfileController,
);

/**
 * Get Buyer Profile By ID
 * @access - Private
 * @method - GET
 * @route - /api/v1/buyer/:userId
 */
router.get(
  "/:userId",
  authenticate,
  authorize([UserRole.BUYER, UserRole.ADMIN]),
  validation(userIdSchema, "params"),
  getBuyerProfileByIdController,
);

/**
 * Delete Buyer Profile By ID
 * @access - Private
 * @method - DELETE
 * @route - /api/v1/buyer/:userId
 */
router.delete(
  "/:userId",
  authenticate,
  authorize([UserRole.BUYER, UserRole.ADMIN]),
  validation(userIdSchema, "params"),
  deleteBuyerProfileController,
);

export default router;
