import cartService from "@/modules/v1/cart/cart.service";
import asyncHandler from "@/utils/asyncHandler";
import MESSAGES from "@/utils/MESSAGE";
import sendResponse from "@/utils/sendResponse";
import type { Request, Response } from "express";
import { status } from "http-status";

const addToCart = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await cartService.addToCart(req.user!.userId, req.body);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: MESSAGES.CART_ITEM_ADDED,
      data: result,
    });
  },
);

const getCart = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await cartService.getCart(req.user!.userId);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: MESSAGES.SUCCESS,
      data: result,
    });
  },
);

const updateCartItem = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const itemId = req.params.itemId as string;
    const result = await cartService.updateCartItemQuantity(
      req.user!.userId,
      itemId,
      req.body.quantity,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: MESSAGES.CART_ITEM_UPDATED,
      data: result,
    });
  },
);

const removeCartItem = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const itemId = req.params.itemId as string;
    const result = await cartService.removeCartItem(req.user!.userId, itemId);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: MESSAGES.CART_ITEM_REMOVED,
      data: result,
    });
  },
);

const cartController = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
};

export default cartController;

