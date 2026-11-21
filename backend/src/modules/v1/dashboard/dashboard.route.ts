import { authenticate, authorize } from "@/middlewares/auth.middleware";
import validateRequest from "@/middlewares/validateRequest";
import { UserRole } from "@/modules/v1/user/user.constant";
import express from "express";
import dashboardController from "./dashboard.controller";
import {
  recentUsersQuerySchema,
  userDetailsParamsSchema,
} from "./dashboard.validation";

const router = express.Router();

// All dashboard routes are strictly protected and accessible only by ADMIN
router.use(authenticate, authorize(UserRole.ADMIN));

router.get("/summary", dashboardController.getSummary);
router.get("/monthly-earnings", dashboardController.getMonthlyEarnings);
router.get("/order-distribution", dashboardController.getOrderDistribution);
router.get(
  "/recent-users",
  validateRequest(recentUsersQuerySchema, "query"),
  dashboardController.getRecentUsers,
);
router.get(
  "/users/:userId",
  validateRequest(userDetailsParamsSchema, "params"),
  dashboardController.getUserDetails,
);

export default router;
