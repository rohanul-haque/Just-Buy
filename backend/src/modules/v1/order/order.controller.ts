/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Modules
 */
import { Types } from "mongoose";

/**
 * Application Modules
 */
import asyncHandler from "@/utils/asyncHandler";
import { API_MESSAGES, HTTP_STATUS } from "@/utils/constants";
import sendResponse from "@/utils/sendResponse";

/**
 * Application Service
 */
import {
  createOrderService,
  getVendorOrdersService,
  updateOrderStatusService,
} from "@/modules/v1/order/order.service";

/**
 * Type
 */
import type { Request, Response } from "express";

/**
 * Create Order Controller
 */
export const createOrderController = asyncHandler(
  async (req: Request, res: Response) => {
    const buyerId = req.userId;

    await createOrderService(buyerId!, req.body);

    sendResponse(res, {
      statusCode: HTTP_STATUS.CREATED,
      success: true,
      message: API_MESSAGES.ORDER_CREATED,
    });
  },
);

/**
 * Controller for Updating Order Status
 */
export const updateOrderStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const orderId = req.params.orderId;
    const { status } = req.body;

    await updateOrderStatusService(
      orderId as unknown as Types.ObjectId,
      status,
    );

    sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: API_MESSAGES.ORDER_STATUS_UPDATED,
    });
  },
);

/**
 * Controller for Get Vendor Orders
 */
export const getVendorOrdersController = asyncHandler(
  async (req: Request, res: Response) => {
    const sellerId = new Types.ObjectId(req.userId!);

    const orders = await getVendorOrdersService(sellerId);

    sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      data: orders,
    });
  },
);
