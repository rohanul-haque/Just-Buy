/**
 * @copyright 2026
 * @author MD Rohanul Hauqe Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Module
 */
import { StatusCodes } from "http-status-codes";

/**
 * Application Modules
 */
import config from "@/config";
import { logger } from "@/lib/winston";
import asyncHandler from "@/utils/asyncHandler";
import { API_MESSAGES } from "@/utils/constants";
import sendResponse from "@/utils/sendResponse";

/**
 * Application Service
 */
import buyerService from "@/modules/v1/buyer/buyer.service";

/**
 * Type
 */
import type { Request, Response } from "express";

/**
 * Controller for get current buyer profile
 */
export const getCurrentBuyerProfile = asyncHandler(
  async (req: Request, res: Response) => {
    // Call get buyer profile by ID service
    const result = await buyerService.getCurrentBuyerProfile({
      id: req.userId!.toString(),
    });

    // Log the get
    if (result) {
      logger.info("Buyer profile fetched successfully", {
        userId: req.userId,
      });
    }

    // Send success response
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      data: result,
    });
  },
);

/**
 * Controller for get buyer profile by ID
 */
export const getBuyerProfileById = asyncHandler(
  async (req: Request, res: Response) => {
    // Get buyer user ID from params
    const { id } = req.params;

    // Call get buyer profile by ID service
    const result = await buyerService.getCurrentBuyerProfile({
      id: id as string,
    });

    // Log the get buyer profile successfully
    if (result) {
      logger.info("Buyer profile fetched successfully", {
        userId: id,
      });
    }

    // Send success response
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      data: result,
    });
  },
);

/**
 * Controlller for get all buyer profile
 */
export const getAllBuyerProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    // Pagination query parameters
    const limit = Number(req.query.limit) || config.DEFAULT_LIMIT;
    const offset = Number(req.query.offset) || config.DEFAULT_OFFSET;

    // Call get all buyer profile service
    const result = await buyerService.getAllBuyerProfile({
      limit,
      offset,
    });

    // Log successful get all buyer profile
    if (result) {
      logger.info("All buyer profiles fetched successfully");
    }

    // Send success response
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      data: result.allBuyers,
      pagination: {
        limit: result.limit,
        skip: result.skip,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    });
  },
);

/**
 * Controller for update buyer profile
 */
export const updateBuyerProfile = asyncHandler(
  async (req: Request, res: Response) => {
    // Update buyer profile
    await buyerService.updateBuyerProfile({
      userId: req.userId!,
      payload: req.body,
      file: req.file,
    });

    // Log successful profile update
    logger.info(API_MESSAGES.BUYER_PROFILE_UPDATED, {
      userId: req.userId,
    });

    // Send success response
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: API_MESSAGES.BUYER_PROFILE_UPDATED,
    });
  },
);

/**
 * Controller for delete buyer profile
 */
export const deleteBuyerProfile = asyncHandler(
  async (req: Request, res: Response) => {
    // Get buyer user ID from params
    const { id } = req.params;

    // Call delete buyer profile service
    await buyerService.deleteBuyerProfile(id as string);

    // Log success
    logger.info(API_MESSAGES.BUYER_PROFILE_DELETED, {
      id,
    });

    // Send success response
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: API_MESSAGES.BUYER_PROFILE_DELETED,
    });
  },
);

/**
 * Buyer controller instance
 */
const buyerController = {
  getCurrentBuyerProfile,
  getBuyerProfileById,
  getAllBuyerProfile,
  updateBuyerProfile,
  deleteBuyerProfile,
};

/**
 * Export default buyerController
 */
export default buyerController;
