import asyncHandler from "@/utils/asyncHandler";
import { clearAuthCookies } from "@/utils/cookie";
import sendResponse from "@/utils/sendResponse";
import type { Request, Response } from "express";
import { status } from "http-status";
import { BUYER_MESSAGES } from "@/modules/v1/buyer/buyer.constant";
import buyerService from "@/modules/v1/buyer/buyer.service";

const getOwnProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await buyerService.getOwnProfile(req.user!.userId);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: BUYER_MESSAGES.PROFILE_RETRIEVED,
      data: result,
    });
  },
);

const updateOwnProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await buyerService.updateOwnProfile(
      req.user!.userId,
      req.body,
      req.file,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: BUYER_MESSAGES.PROFILE_UPDATED,
      data: result,
    });
  },
);

const deleteOwnAccount = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await buyerService.deleteOwnAccount(req.user!.userId);
    clearAuthCookies(res);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: result.message,
    });
  },
);

const getAllBuyers = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await buyerService.getAllBuyers(req.query);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: BUYER_MESSAGES.BUYERS_RETRIEVED,
      data: result.data,
      pagination: result.pagination,
    });
  },
);

const getBuyerById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const buyerId = req.params.buyerId as string;
    const result = await buyerService.getBuyerById(buyerId);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: BUYER_MESSAGES.PROFILE_RETRIEVED,
      data: result,
    });
  },
);

const updateBuyerStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const buyerId = req.params.buyerId as string;
    const result = await buyerService.updateBuyerStatus(
      buyerId,
      req.body.status,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: BUYER_MESSAGES.STATUS_UPDATED,
      data: result,
    });
  },
);

const buyerController = {
  getOwnProfile,
  updateOwnProfile,
  deleteOwnAccount,
  getAllBuyers,
  getBuyerById,
  updateBuyerStatus,
};

export default buyerController;
