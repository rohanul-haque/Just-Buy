import { ORDER_MESSAGES } from "@/modules/v1/order/order.constant";
import orderService from "@/modules/v1/order/order.service";
import { PAYMENT_MESSAGES } from "@/modules/v1/payment/payment.constant";
import paymentService from "@/modules/v1/payment/payment.service";
import asyncHandler from "@/utils/asyncHandler";
import sendResponse from "@/utils/sendResponse";
import type { Request, Response } from "express";
import { status } from "http-status";

const createOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await orderService.createOrder(req.user!.userId, req.body);

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: ORDER_MESSAGES.ORDER_CREATED,
      data: result,
    });
  },
);

const getMyOrders = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await orderService.getMyOrders(
      req.user!.userId,
      req.query as any,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: ORDER_MESSAGES.ORDERS_FETCHED,
      data: result.data,
      pagination: result.pagination,
    });
  },
);

const getOrderById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.orderId as string;
    const result = await orderService.getOrderById(req.user!, orderId);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: ORDER_MESSAGES.ORDER_FETCHED,
      data: result,
    });
  },
);

const cancelOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.orderId as string;
    const result = await orderService.cancelOrder(req.user!.userId, orderId);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: ORDER_MESSAGES.ORDER_CANCELLED,
      data: result,
    });
  },
);

const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.orderId as string;
    const result = await orderService.updateOrderStatus(
      orderId,
      req.body,
      req.user!,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: ORDER_MESSAGES.ORDER_STATUS_UPDATED,
      data: result,
    });
  },
);

const getAllOrders = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await orderService.getAllOrders(req.query as any);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: ORDER_MESSAGES.ORDERS_FETCHED,
      data: result.data,
      pagination: result.pagination,
    });
  },
);

const getVendorOrders = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await orderService.getVendorOrders(
      req.user!.userId,
      req.query as any,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: ORDER_MESSAGES.ORDERS_FETCHED,
      data: result.data,
      pagination: result.pagination,
    });
  },
);

const confirmCODPayment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.orderId as string;
    const result = await paymentService.confirmCODPayment(orderId, {
      userId: req.user!.userId,
      role: req.user!.role,
    });

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: PAYMENT_MESSAGES.COD_PAYMENT_CONFIRMED,
      data: result,
    });
  },
);

const orderController = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
  getVendorOrders,
  confirmCODPayment,
};

export default orderController;
