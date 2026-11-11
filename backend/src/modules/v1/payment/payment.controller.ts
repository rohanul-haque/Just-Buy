import { PAYMENT_MESSAGES } from "@/modules/v1/payment/payment.constant";
import paymentService from "@/modules/v1/payment/payment.service";
import AppError from "@/utils/AppError";
import asyncHandler from "@/utils/asyncHandler";
import ERROR_CODE from "@/utils/ERROR_CODES";
import sendResponse from "@/utils/sendResponse";
import type { Request, Response } from "express";
import { status } from "http-status";

const handleStripeWebhook = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      throw new AppError(
        status.BAD_REQUEST,
        ERROR_CODE.VALIDATION_ERROR,
        "Stripe signature header is missing",
      );
    }

    const rawBody =
      (req as any).rawBody ||
      (Buffer.isBuffer(req.body)
        ? req.body
        : typeof req.body === "string"
          ? req.body
          : JSON.stringify(req.body));

    const result = await paymentService.handleStripeWebhook(rawBody, signature);

    res.status(status.OK).json({
      received: true,
      event: result.event,
    });
  },
);

const verifyStripeSession = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const sessionId =
      (req.params.sessionId as string) ||
      (req.query.session_id as string) ||
      (req.query.sessionId as string);

    if (!sessionId) {
      throw new AppError(
        status.BAD_REQUEST,
        ERROR_CODE.VALIDATION_ERROR,
        "Session ID is required",
      );
    }

    const result = await paymentService.verifyStripeCheckoutSession(
      sessionId,
      req.user!.userId,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: result.status !== "FAILED",
      message: result.message,
      data: result,
    });
  },
);

const getPaymentByOrderId = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.orderId as string;
    const result = await paymentService.getPaymentByOrderId(
      orderId,
      req.user!.userId,
    );

    if (!result) {
      throw new AppError(
        status.NOT_FOUND,
        ERROR_CODE.PAYMENT_NOT_FOUND,
        PAYMENT_MESSAGES.PAYMENT_NOT_FOUND,
      );
    }

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: PAYMENT_MESSAGES.PAYMENT_SUCCESS,
      data: result,
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

const paymentController = {
  handleStripeWebhook,
  verifyStripeSession,
  confirmCODPayment,
  getPaymentByOrderId,
};

export default paymentController;
