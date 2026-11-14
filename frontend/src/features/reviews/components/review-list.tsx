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
    <section className="space-y-6 pt-8 pb-4 border-t border-border/60">
      {/* Section Header matching Figma */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="h-7 w-3 rounded-xs bg-primary inline-block" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Ratings &amp; Reviews ({reviews.length})
          </h2>
        </div>

        {reviews.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="text-xs sm:text-sm font-semibold text-primary hover:underline underline-offset-4 cursor-pointer"
          >
            {showAll ? "Show Less" : "See All"}
          </button>
        )}
      </div>

      {/* Review Submission Form */}
      <ReviewForm productId={productId} />

      {/* Reviews Stream */}
      {isLoading ? (
        <div className="space-y-4 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2 py-3 border-b border-border/50">
              <Skeleton className="h-4 w-40 rounded-xs" />
              <Skeleton className="h-3 w-24 rounded-xs" />
              <Skeleton className="h-8 w-full rounded-xs" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/80 p-8 text-center space-y-1.5">
          <p className="text-sm font-semibold text-foreground">No reviews yet</p>
          <p className="text-xs text-muted-foreground">
            There are no customer reviews for this product yet. Verified buyers can share their feedback above.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {displayedReviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </div>
      )}
    </section>
  );
}
