/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-party Module
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
import wishlistService from "@/modules/v1/wishlist/wishlist.service";

/**
 * Type
 */
import type { Request, Response } from "express";

/**
 * Controller for adding a product to the wishlist
 */
export const addWishlist = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const buyerId = req.userId!;

  await wishlistService.addWishlist({
    buyerId,
    id: id as string,
  });

  logger.info(API_MESSAGES.WISHLIST_CREATED, {
    buyerId: buyerId,
    productId: id,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: API_MESSAGES.WISHLIST_ITEM_ADDED,
  });
});

/**
 * Controller for getting all wishlist items
 */
export const allWishlist = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || config.DEFAULT_LIMIT;
  const offset = Number(req.query.offset) || config.DEFAULT_OFFSET;

  const buyerId = req.userId!;

  const result = await wishlistService.getAllWishlists({
    buyerId,
    limit,
    offset,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    data: result,
  });
});

/**
 * Controller for removing a product from the wishlist
 */
export const removeWishlist = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const buyerId = req.userId!;

    await wishlistService.removeWishlist({
      buyerId,
      id: id as string,
    });

    logger.info(API_MESSAGES.WISHLIST_ITEM_REMOVED, {
      buyerId,
      productId: id,
    });

    sendResponse(res, {
      statusCode: StatusCodes.NO_CONTENT,
      success: true,
      message: API_MESSAGES.WISHLIST_ITEM_REMOVED,
    });
  },
);

const wishListController = { addWishlist, allWishlist, removeWishlist };

export default wishListController;
