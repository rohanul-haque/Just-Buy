/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Application Modules
 */
import asyncHandler from "@/utils/asyncHandler";

/**
 * Application Services
 */

/**
 * Type
 */
import sendResponse from "@/utils/sendResponse";
import type { Request, Response } from "express";
import { addWishlistService } from "./wishlist.service";
import { HTTP_STATUS } from "@/utils/constants";

export const addWishlistController = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params;
    const buyerId = req.userId;

    await addWishlistService(buyerId, productId);

    sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: "Wishlist added successfully",
    });
  },
);
