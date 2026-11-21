import api from "@/lib/axios";
import type { Review, CreateReviewInput } from "@/features/reviews/types";

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export const reviewService = {
  /**
   * Fetch public reviews for a product
   */
  async getProductReviews(productId: string): Promise<Review[]> {
    const response = await api.get<ApiResponse<Review[]>>(
      `/reviews/${productId}`,
    );

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to load reviews");
    }

    return response.data.data;
  },

  /**
   * Create a new review for a delivered product (authenticated buyer only)
   */
  async createReview(payload: CreateReviewInput): Promise<Review> {
    const response = await api.post<ApiResponse<Review>>("/reviews", payload);

    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to submit review");
    }

    return response.data.data;
  },
};

