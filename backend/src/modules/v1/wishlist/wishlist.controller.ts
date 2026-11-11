import wishlistService from "@/modules/v1/wishlist/wishlist.service";
import asyncHandler from "@/utils/asyncHandler";
import MESSAGES from "@/utils/MESSAGE";
import sendResponse from "@/utils/sendResponse";
import type { Request, Response } from "express";
import { status } from "http-status";

const addItem = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await wishlistService.addProductToWishlist(
      req.user!.userId,
      req.body.productId,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: MESSAGES.WISHLIST_ITEM_ADDED,
      data: result,
    });
  },
);

const getMyWishlist = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await wishlistService.getWishlist(req.user!.userId);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: MESSAGES.SUCCESS,
      data: result,
    });
  },
);

const removeItem = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const productId = req.params.productId as string;
    const result = await wishlistService.removeProductFromWishlist(
      req.user!.userId,
      productId,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: MESSAGES.WISHLIST_ITEM_REMOVED,
      data: result,
    });
  },
);

const wishlistController = {
  addItem,
  getMyWishlist,
  removeItem,
};

export default wishlistController;

