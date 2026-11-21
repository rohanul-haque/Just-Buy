import { OrderStatus } from "@/modules/v1/order/order.constant";
import Order from "@/modules/v1/order/order.model";
import Product from "@/modules/v1/product/product.model";
import { REVIEW_MESSAGES } from "@/modules/v1/review/review.constant";
import type {
  ICreateReviewInput,
  IReview,
} from "@/modules/v1/review/review.interface";
import Review from "@/modules/v1/review/review.model";
import AppError from "@/utils/AppError";
import ERROR_CODE from "@/utils/ERROR_CODES";
import { status } from "http-status";

/**
 * Create a new review for a product
 * - Allowed only for buyers who purchased the product through a DELIVERED order
 * - Enforces 1 review per buyer per product
 */
const createReview = async (
  buyerId: string,
  payload: ICreateReviewInput,
): Promise<IReview> => {
  // 1. Verify that the product exists
  const product = await Product.findById(payload.product);
  if (!product) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.PRODUCT_NOT_FOUND,
      REVIEW_MESSAGES.PRODUCT_NOT_FOUND,
    );
  }

  // 2. Verify that the buyer purchased this product in a DELIVERED order
  const isDeliveredOrder = await Order.exists({
    buyer: buyerId,
    status: OrderStatus.DELIVERED,
    "productItems.product": payload.product,
  });

  if (!isDeliveredOrder) {
    throw new AppError(
      status.BAD_REQUEST,
      ERROR_CODE.REVIEW_NOT_ALLOWED,
      REVIEW_MESSAGES.REVIEW_NOT_ALLOWED,
    );
  }

  // 3. Service-level check for duplicate review
  const existingReview = await Review.findOne({
    product: payload.product,
    buyer: buyerId,
  });

  if (existingReview) {
    throw new AppError(
      status.CONFLICT,
      ERROR_CODE.REVIEW_ALREADY_EXISTS,
      REVIEW_MESSAGES.REVIEW_ALREADY_EXISTS,
    );
  }

  // 4. Create review document with duplicate key error handling
  try {
    const review = await Review.create({
      product: payload.product,
      buyer: buyerId,
      rating: payload.rating,
      comment: payload.comment,
    });

    return review;
  } catch (error: any) {
    if (error?.code === 11000) {
      throw new AppError(
        status.CONFLICT,
        ERROR_CODE.REVIEW_ALREADY_EXISTS,
        REVIEW_MESSAGES.REVIEW_ALREADY_EXISTS,
      );
    }
    throw error;
  }
};

/**
 * Retrieve public reviews for a product
 * - Verifies product exists
 * - Populates safe buyer information
 * - Sorts by newest first (createdAt: -1)
 */
const getProductReviews = async (productId: string): Promise<IReview[]> => {
  // 1. Verify that the product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.PRODUCT_NOT_FOUND,
      REVIEW_MESSAGES.PRODUCT_NOT_FOUND,
    );
  }

  // 2. Fetch reviews with safe buyer fields sorted by newest first
  const reviews = await Review.find({ product: productId })
    .populate("buyer", "name email")
    .sort({ createdAt: -1 });

  return reviews;
};

const reviewService = {
  createReview,
  getProductReviews,
};

export default reviewService;

