/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Thired Party Modules
 */
import { Types } from "mongoose";

/**
 * Application Modules
 */
import config from "@/config";
import { logger } from "@/lib/winston";
import asyncHandler from "@/utils/asyncHandler";
import { API_MESSAGES, HTTP_STATUS } from "@/utils/constants";
import sendResponse from "@/utils/sendResponse";

/**
 * Services
 */
import {
  deleteControllerSellerService,
  getAllSellerProfileService,
  getCurrentSellerProfileService,
  updateSellerService,
} from "@/modules/v1/seller/seller.service";

/**
 * Type
 */
import type { SellerVerificationStatus } from "@/modules/v1/seller/seller.interface";
import type { Request, Response } from "express";

/**
 * Controller for get current seller profile
 */
export const getCurrentSellerProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    // Call get seller profile by id service
    const result = await getCurrentSellerProfileService({
      userId: req.userId!,
    });

    // Log the success message
    logger.info("Seller Profile Get Successfully");

    // Send success response
    sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      data: result,
    });
  },
);

/**
 * Controller for get seller profile by id
 */
export const getSellerProfileByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    // Get seller id from request parameters
    const { userId } = req.params;

    // Get seller profile by id service
    const result = await getCurrentSellerProfileService({
      userId: userId as unknown as Types.ObjectId,
    });

    // Log the success message
    logger.info("Seller profile fetched successfully");

    // Send success response
    sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      data: result,
    });
  },
);

/**
 * Controller for seller update
 */
export const updateSellerController = asyncHandler(
  async (req: Request, res: Response) => {
    // Call update seller service
    await updateSellerService({
      userId: req.userId!,
      payload: req.body,
      file: req.file,
    });

    // Log the success message
    logger.info(API_MESSAGES.SELLER_PROFILE_UPDATED);

    // Send success response
    sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: API_MESSAGES.SELLER_PROFILE_UPDATED,
    });
  },
);

/**
 * Controller for delete seller profile
 */
export const deleteSellerProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    // Get seller id from request parameters
    const { userId } = req.params;

    // Delete seller profile service
    await deleteControllerSellerService({
      userId: userId as unknown as Types.ObjectId,
    });

    // Log the success message
    logger.info(API_MESSAGES.SELLER_PROFILE_DELETED);

    // Send success response
    sendResponse(res, {
      statusCode: HTTP_STATUS.NO_CONTENT,
      success: true,
      message: API_MESSAGES.SELLER_PROFILE_DELETED,
    });
  },
);

/**
 * Controller for get all seller profile
 */
export const getAllSellerProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    // Get limit and offset from request query parameters
    const limit =
      parseInt(req.query.limit as string, 15) || config.DEFAULT_LIMIT;
    const offset =
      parseInt(req.query.offset as string, 15) || config.DEFAULT_OFFSET;
    const verificationStatus = req.query
      .verificationStatus as SellerVerificationStatus;

    // Get all seller profile service
    const result = await getAllSellerProfileService({
      limit,
      offset,
      verificationStatus: verificationStatus || undefined,
    });

    // Log the success message
    logger.info("Seller profiles fetched successfully");

    // Send success response
    sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      data: result.allSellers,
      total: result.total,
      skip: result.skip,
      limit: result.limit,
    });
  },
);
