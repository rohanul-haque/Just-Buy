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
import sellerController from "@/modules/v1/seller/seller.controller";

/**
 * Validations
 */
import { UserRole } from "@/modules/v1/auth/auth.interface";
import {
  changeSellerStatusSchema,
  idSchema,
  sellerListQuerySchema,
  updateSellerSchema,
} from "@/modules/v1/seller/seller.validation";

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
  sellerController.getCurrentSellerProfile,
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
  sellerController.getAllSellerProfile,
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
  sellerController.updateSeller,
);

/**
 * Update Current Seller Profile
 * @access - Private
 * @method - PATCH
 * @route - /api/v1/seller/:id
 */
router.patch(
  "/:id/status",
  authenticate,
  authorize([UserRole.ADMIN]),
  validation(idSchema, "params"),
  validation(changeSellerStatusSchema, "body"),
  sellerController.changeSellerStatus,
);

/**
 * Get Seller Profile By ID
 * @access - Private
 * @method - GET
 * @route - /api/v1/seller/:ID
 */
router.get(
  "/:id",
  authenticate,
  authorize([UserRole.SELLER, UserRole.ADMIN]),
  validation(idSchema, "params"),
  sellerController.getSellerProfileById,
);

/**
 * Delete Seller Profile By ID
 * @access - Private
 * @method - DELETE
 * @route - /api/v1/seller/:userId
 */
router.delete(
  "/:id",
  authenticate,
  authorize([UserRole.SELLER, UserRole.ADMIN]),
  validation(idSchema, "params"),
  sellerController.deleteSellerProfile,
);

export default router;
