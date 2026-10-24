/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Thired Party Modules
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
 * Services
 */
import sellerService from "@/modules/v1/seller/seller.service";

/**
 * Type
 */
import { SellerVerificationStatus } from "@/modules/v1/seller/seller.interface";
import type { Request, Response } from "express";

/**
 * Controller for get current seller profile
 */
export const getCurrentSellerProfile = asyncHandler(
  async (req: Request, res: Response) => {
    // Call get current seller profile service
    const result = await sellerService.getCurrentSellerProfile(
      req.userId!.toString(),
    );

    // Log successful profile retrieval.
    if (result) {
      logger.info("Seller profile fetched successfully", {
        userId: req.userId!,
      });
    }

    // Send the seller profile response.
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      data: result,
    });
  },
);

/**
 * Controller for get seller profile by id
 */
export const getSellerProfileById = asyncHandler(
  async (req: Request, res: Response) => {
    // Get seller id from request parameters
    const { id } = req.params;

    // Call get seller profile by id service
    const result = await sellerService.getCurrentSellerProfile(id as string);

    // Log the success message
    if (result) {
      logger.info("Seller profile fetched successfully", {
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
 * Controller for get all seller profile
 */
export const getAllSellerProfile = asyncHandler(
  async (req: Request, res: Response) => {
    // Pagination query parameters.
    const limit = Number(req.query.limit) || config.DEFAULT_LIMIT;
    const offset = Number(req.query.offset) || config.DEFAULT_OFFSET;

    // Default verification status is VERIFIED.
    const verificationStatus =
      (req.query.verificationStatus as SellerVerificationStatus) ||
      SellerVerificationStatus.VERIFIED;

    // Call get all seller profile service
    const result = await sellerService.getAllSellerProfileService({
      limit,
      offset,
      verificationStatus,
    });

    // Log successful get all seller profile
    if (result) {
      logger.info("All seller profiles fetched successfully");
    }

    // Send success response
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      data: result.allSellers,
      pagination: {
        total: result.total,
        limit: result.limit,
        skip: result.skip,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    });
  },
);

/**
 * Controller for seller update
 */
export const updateSeller = asyncHandler(
  async (req: Request, res: Response) => {
    // Call update seller service
    await sellerService.updateSeller({
      userId: req.userId!,
      payload: req.body,
      file: req.file,
    });

    // Log the success message
    logger.info(API_MESSAGES.SELLER_PROFILE_UPDATED);

    // Send success response
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: API_MESSAGES.SELLER_PROFILE_UPDATED,
    });
  },
);

/**
 * Controller for delete seller profile
 */
export const deleteSellerProfile = asyncHandler(
  async (req: Request, res: Response) => {
    // Get seller id from request parameters
    const { id } = req.params;

    // Delete seller profile service
    await sellerService.deleteSeller(id as string);

    // Log the success message
    logger.info(API_MESSAGES.SELLER_PROFILE_DELETED);

    // Send success response
    sendResponse(res, {
      statusCode: StatusCodes.NO_CONTENT,
      success: true,
      message: API_MESSAGES.SELLER_PROFILE_DELETED,
    });
  },
);

/**
 * Controller for change seller status
 */
const changeSellerStatus = asyncHandler(async (req: Request, res: Response) => {
  // Get id from request parameters and status from request body
  const { id } = req.params;
  const { status } = req.body;

  // Call change seller status service
  await sellerService.changeSellerStatus({
    id: id as string,
    status: status as SellerVerificationStatus,
  });

  // Log the success message
  logger.info(API_MESSAGES.SELLER_STATUS_CHANGED);

  // Send success response
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: API_MESSAGES.SELLER_STATUS_CHANGED,
  });
});

/**
 * Seller controller instance
 */
const sellerController = {
  getCurrentSellerProfile,
  getSellerProfileById,
  getAllSellerProfile,
  updateSeller,
  deleteSellerProfile,
  changeSellerStatus,
};

/**
 * Export default sellerController
 */
export default sellerController;
