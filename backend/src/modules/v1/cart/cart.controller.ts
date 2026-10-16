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
} from "@/modules/v1/cart/cart.service";
import asyncHandler from "@/utils/asyncHandler";
import { API_MESSAGES, HTTP_STATUS } from "@/utils/constants";
import sendResponse from "@/utils/sendResponse";

/**
 * Type
 */
import type { Request, Response } from "express";

/**
 * Add Product to Cart Controller
 */
export const addToCartController = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params;
    const buyerId = req.userId!;
    const { quantity } = req.body;

    const result = await addToCartService({
      buyerId,
      productId: productId as unknown as Types.ObjectId,
      quantity,
    });

    sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: API_MESSAGES.CART_ITEM_ADDED,
      data: result,
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
// export const updateCartQuantityController = asyncHandler(
//   async (req: Request, res: Response) => {
//     const { productId } = req.params;
//     const buyerId = new Types.ObjectId(req.userId!);
//     const { quantity } = req.body;

//     const result = await updateCartQuantityService({
//       buyerId,
//       productId: new Types.ObjectId(productId),
//       quantity,
//     });

//     sendResponse(res, {
//       statusCode: HTTP_STATUS.OK,
//       success: true,
//       message: "Cart quantity updated successfully",
//       data: result,
//     });
//   },
// );

/**
 * Remove Product from Cart Controller
 */
// export const removeFromCartController = asyncHandler(
//   async (req: Request, res: Response) => {
//     const { productId } = req.params;
//     const buyerId = new Types.ObjectId(req.userId!);

//     const result = await removeFromCartService(
//       buyerId,
//       new Types.ObjectId(productId),
//     );

//     sendResponse(res, {
//       statusCode: HTTP_STATUS.OK,
//       success: true,
//       message: "Product removed from cart successfully",
//       data: result,
//     });
//   },
// );
