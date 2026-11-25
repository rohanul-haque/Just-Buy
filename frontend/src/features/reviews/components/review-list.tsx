"use client";

import * as React from "react";
import { useProductReviews } from "@/features/reviews/hooks/use-reviews";
import { ReviewCard } from "@/features/reviews/components/review-card";
import { ReviewForm } from "@/features/reviews/components/review-form";
import { Skeleton } from "@/components/ui/skeleton";

interface ReviewListProps {
  productId: string;
}

export function ReviewList({ productId }: ReviewListProps) {
  const { data: dbReviews, isLoading } = useProductReviews(productId);
  const [showAll, setShowAll] = React.useState(false);

  const reviews = dbReviews ?? [];
  const displayedReviews = showAll ? reviews : reviews.slice(0, 5);

  return (
    <section className="space-y-6 pt-10 pb-8 border-t border-neutral-200">
      {/* Header matching Mockup: Orange pill button */}
      <div className="flex items-center justify-between gap-4">
        <div className="inline-block bg-[#ff6200] text-white font-semibold text-sm px-6 py-2.5 rounded-md shadow-xs">
          Ratings &amp; Reviews
        </div>

        {reviews.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="text-xs sm:text-sm font-semibold text-[#ff6200] hover:underline underline-offset-4 cursor-pointer"
          >
            {showAll ? "Show Less" : "See All"}
          </button>
        )}
      </div>

      {/* Reviews Stream */}
      {isLoading ? (
        <div className="space-y-4 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2 py-3 border-b border-neutral-200">
              <Skeleton className="h-4 w-40 rounded-xs" />
              <Skeleton className="h-3 w-24 rounded-xs" />
              <Skeleton className="h-8 w-full rounded-xs" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center space-y-1.5">
          <p className="text-sm font-semibold text-neutral-800">No reviews yet</p>
          <p className="text-xs text-neutral-500">
            Be the first customer to share your experience with this product.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-200">
          {displayedReviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </div>
      )}

      {/* Review Submission Form at the bottom: "একদম নিচে থাকবে অ্যাড রিভিউয়ের অপশন" */}
      <div className="pt-6">
        <ReviewForm productId={productId} />
      </div>
    </section>
  );
}

export default ReviewList;
