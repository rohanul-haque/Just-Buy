/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-party Modules
 */
import { StatusCodes } from "http-status-codes";

/**
 * Application Modules
 */
import cartService from "@/modules/v1/cart/cart.service";
import asyncHandler from "@/utils/asyncHandler";
import { API_MESSAGES } from "@/utils/constants";
import sendResponse from "@/utils/sendResponse";

/**
 * Type
 */
import { logger } from "@/lib/winston";
import type { Request, Response } from "express";

/**
 * Add Product to Cart Controller
 */
export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const buyerId = req.userId!;
  const { quantity } = req.body;

  console.log(id);

  await cartService.addToCart({
    buyerId,
    id: id as string,
    quantity,
  });

  logger.info(API_MESSAGES.CART_ITEM_ADDED, {
    buyerId,
    productId: id,
    quantity,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: API_MESSAGES.CART_ITEM_ADDED,
  });
});

/**
 * Get Cart Controller
 */
export const getAllCarts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const buyerId = req.userId!;

    const cart = await cartService.getAllCart(buyerId);

    logger.info("Cart fetched successfully", { buyerId });

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      data: cart,
    });
  },
);

/**
 * Update Cart Quantity Controller
 */
export const updateCartQuantity = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const buyerId = req.userId!;
    const { quantity } = req.body;

    await cartService.updateCartQuantity({
      buyerId,
      id: id as string,
      quantity,
    });

    logger.info(API_MESSAGES.CART_ITEM_UPDATED, {
      buyerId,
      productId: id,
      quantity,
    });

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: API_MESSAGES.CART_ITEM_UPDATED,
    });
  },
);

/**
 * Remove Product from Cart Controller
 */
// const removeFromCart = asyncHandler(async (req: Request, res: Response) => {
//   const { productId } = req.params;
//   const buyerId = req.userId!;

//   await removeFromCartService({
//     buyerId,
//     productId: productId as unknown as Types.ObjectId,
//   });

//   logger.info(API_MESSAGES.CART_ITEM_REMOVED, productId);

//   sendResponse(res, {
//     statusCode: StatusCodes.OK,
//     success: true,
//     message: API_MESSAGES.CART_ITEM_REMOVED,
//   });
// });

const cartController = { addToCart, getAllCarts, updateCartQuantity };

export default cartController;
