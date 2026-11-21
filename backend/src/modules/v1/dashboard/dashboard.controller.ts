import asyncHandler from "@/utils/asyncHandler";
import sendResponse from "@/utils/sendResponse";
import { DASHBOARD_MESSAGES } from "./dashboard.constant";
import dashboardService from "./dashboard.service";
import type { Request, Response } from "express";
import { status } from "http-status";

export const dashboardController = {
  getSummary: asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const summary = await dashboardService.getSummary();

      sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: DASHBOARD_MESSAGES.SUMMARY_RETRIEVED,
        data: summary,
      });
    },
  ),

  getMonthlyEarnings: asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const monthlyEarnings = await dashboardService.getMonthlyEarnings();

      sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: DASHBOARD_MESSAGES.MONTHLY_EARNINGS_RETRIEVED,
        data: monthlyEarnings,
      });
    },
  ),

  getOrderDistribution: asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const distribution = await dashboardService.getOrderDistribution();

      sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: DASHBOARD_MESSAGES.ORDER_DISTRIBUTION_RETRIEVED,
        data: distribution,
      });
    },
  ),

  getRecentUsers: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { page, limit } = req.query as {
        page?: string;
        limit?: string;
      };

      const result = await dashboardService.getRecentUsers({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: DASHBOARD_MESSAGES.RECENT_USERS_RETRIEVED,
        data: {
          users: result.users,
          pagination: result.pagination,
        },
        pagination: result.pagination,
      });
    },
  ),

  getUserDetails: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = Array.isArray(req.params.userId)
        ? req.params.userId[0]
        : req.params.userId;

      const userDetails = await dashboardService.getUserDetails(userId);

      sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: DASHBOARD_MESSAGES.USER_DETAILS_RETRIEVED,
        data: userDetails,
      });
    },
  ),
};

export default dashboardController;
