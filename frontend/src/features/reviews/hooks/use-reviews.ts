import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "@/features/reviews/services/review-service";
import type { Review, CreateReviewInput } from "@/features/reviews/types";
import { PRODUCT_KEYS } from "@/features/products/hooks/use-products";

export const REVIEW_KEYS = {
  product: (productId: string) => ["reviews", productId] as const,
};

export function useProductReviews(productId: string) {
  return useQuery<Review[], Error>({
    queryKey: REVIEW_KEYS.product(productId),
    queryFn: () => reviewService.getProductReviews(productId),
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useCreateReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation<Review, Error, CreateReviewInput>({
    mutationFn: (payload) => reviewService.createReview(payload),
    onSuccess: () => {
      // Invalidate reviews list for this product
      queryClient.invalidateQueries({
        queryKey: REVIEW_KEYS.product(productId),
      });
      // Invalidate product details to refresh review count & rating
      queryClient.invalidateQueries({
        queryKey: PRODUCT_KEYS.detail(productId),
      });
    },
  });
}

