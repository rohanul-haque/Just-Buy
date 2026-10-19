/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-party Modules
 */
import { Types } from "mongoose";

/**
 * Application Modules
 */
import {
  addToCartService,
  getCartService,
  removeFromCartService,
  updateCartQuantityService,
} from "@/modules/v1/cart/cart.service";
import asyncHandler from "@/utils/asyncHandler";
import { API_MESSAGES, HTTP_STATUS } from "@/utils/constants";
import sendResponse from "@/utils/sendResponse";

/**
 * Type
 */
import { logger } from "@/lib/winston";
import type { Request, Response } from "express";

/**
 * Add Product to Cart Controller
 */
export const addToCartController = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params;
    const buyerId = req.userId!;
    const { quantity } = req.body;

    await addToCartService({
      buyerId,
      productId: productId as unknown as Types.ObjectId,
      quantity,
    });

    logger.info(API_MESSAGES.CART_ITEM_ADDED, { productId });

    sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: API_MESSAGES.CART_ITEM_ADDED,
    });
  },
);

/**
 * Get Cart Controller
 */
export const getCartController = asyncHandler(
  async (req: Request, res: Response) => {
    const buyerId = req.userId!;

    const result = await getCartService(buyerId);

    logger.info("Cart fetched successfully", result);

    sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      data: result,
    });
  },
);

/**
 * Update Cart Quantity Controller
 */
export const updateCartQuantityController = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params;
    const buyerId = req.userId!;
    const { quantity } = req.body;

    await updateCartQuantityService({
      buyerId,
      productId: productId as unknown as Types.ObjectId,
      quantity,
    });

    logger.info(API_MESSAGES.CART_ITEM_UPDATED, { productId });

    sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: API_MESSAGES.CART_ITEM_UPDATED,
    });
  },
);

/**
 * Remove Product from Cart Controller
 */
export const removeFromCartController = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params;
    const buyerId = req.userId!;

    await removeFromCartService({
      buyerId,
      productId: productId as unknown as Types.ObjectId,
    });

    logger.info(API_MESSAGES.CART_ITEM_REMOVED, productId);

    sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: API_MESSAGES.CART_ITEM_REMOVED,
    });
  },
);
