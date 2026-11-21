import { authenticate, authorize } from "@/middlewares/auth.middleware";
import validateRequest from "@/middlewares/validateRequest";
import { UserRole } from "@/modules/v1/user/user.constant";
import earningsController from "./earnings.controller";
import {
  earningsOrderIdSchema,
  earningsQuerySchema,
} from "./earnings.validation";
import express from "express";

const router = express.Router();

// All earnings routes are strictly protected and accessible only by ADMIN
router.use(authenticate, authorize(UserRole.ADMIN));

router.get("/summary", earningsController.getEarningsSummary);

router.get(
  "/",
  validateRequest(earningsQuerySchema, "query"),
  earningsController.getEarningsTransactions,
);

router.get(
  "/:orderId",
  validateRequest(earningsOrderIdSchema, "params"),
  earningsController.getEarningsTransactionDetails,
);

export default router;
