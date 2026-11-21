import verificationService from "@/modules/v1/verification/verification.service";
import asyncHandler from "@/utils/asyncHandler";
import sendResponse from "@/utils/sendResponse";
import type { Request, Response } from "express";
import { status } from "http-status";

const verifyOtp = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await verificationService.verifyEmailOtp(req.body);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: result.message,
    });
  },
);

const resendOtp = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await verificationService.resendVerificationOtp(req.body);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: result.message,
    });
  },
);

const verificationController = {
  verifyOtp,
  resendOtp,
};

export default verificationController;
