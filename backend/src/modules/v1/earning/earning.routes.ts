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
import { getEarningsController } from "@/modules/v1/earning/earning.controller";

/**
 * Type
 */
import { UserRole } from "@/modules/v1/auth/auth.intarface";

/**
 * Router
 */
const router = Router();

/**
 * Get Earnings
 * @access - Private
 * @method - GET
 * @route - /api/v1/earning
 */
router.get(
  "/",
  authenticate,
  authorize([UserRole.ADMIN, UserRole.SELLER]),
  getEarningsController,
);

export default router;
