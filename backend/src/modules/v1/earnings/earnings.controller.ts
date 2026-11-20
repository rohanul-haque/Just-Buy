import asyncHandler from "@/utils/asyncHandler";
import sendResponse from "@/utils/sendResponse";
import { EARNINGS_MESSAGES } from "./earnings.constant";
import earningsService from "./earnings.service";
import type { Request, Response } from "express";
import { status } from "http-status";

export const earningsController = {
  getEarningsSummary: asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const summary = await earningsService.getEarningsSummary();

      sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: EARNINGS_MESSAGES.SUMMARY_RETRIEVED,
        data: summary,
      });
    },
  ),

  getEarningsTransactions: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { page, limit, skip, search } = req.query as {
        page?: string;
        limit?: string;
        skip?: string;
        search?: string;
      };

      const result = await earningsService.getEarningsTransactions({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        skip: skip !== undefined ? Number(skip) : undefined,
        search,
      });

      sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: EARNINGS_MESSAGES.TRANSACTIONS_RETRIEVED,
        data: result.data,
        pagination: result.pagination,
      });
    },
  ),

  getEarningsTransactionDetails: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const orderId = Array.isArray(req.params.orderId)
        ? req.params.orderId[0]
        : req.params.orderId;

      const details =
        await earningsService.getEarningsTransactionDetails(orderId);

      sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: EARNINGS_MESSAGES.TRANSACTION_DETAILS_RETRIEVED,
        data: details,
      });
    },
  ),
};

export default earningsController;
