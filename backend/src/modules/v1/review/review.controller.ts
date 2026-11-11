import { REVIEW_MESSAGES } from "@/modules/v1/review/review.constant";
import reviewService from "@/modules/v1/review/review.service";
import asyncHandler from "@/utils/asyncHandler";
import sendResponse from "@/utils/sendResponse";
import type { Request, Response } from "express";
import { status } from "http-status";

const createReview = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await reviewService.createReview(
      req.user!.userId,
      req.body,
    );

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: REVIEW_MESSAGES.REVIEW_CREATED,
      data: result,
    });
  },
);

const getProductReviews = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { productId } = req.params;
    const result = await reviewService.getProductReviews(productId as string);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: REVIEW_MESSAGES.REVIEWS_FETCHED,
      data: result,
    });
  },
);

const reviewController = {
  createReview,
  getProductReviews,
};

export default reviewController;

