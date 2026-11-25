"use client";

import * as React from "react";
import { Star } from "lucide-react";
import type { Review } from "@/features/reviews/types";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  review: Review;
  className?: string;
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  const formattedDate = React.useMemo(() => {
    try {
      const now = Date.now();
      const created = new Date(review.createdAt).getTime();
      const diffMinutes = Math.floor((now - created) / 60000);
      if (diffMinutes < 60) return "Just now";
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const date = new Date(review.createdAt);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Just now";
    }
  }, [review.createdAt]);

  const buyerName = review.buyer?.name || "Dianne Russell";

  return (
    <div className={cn("space-y-2.5 py-4 sm:py-5 border-b border-neutral-200", className)}>
      {/* Reviewer Header: Avatar + Name + Relative time */}
      <div className="flex items-center gap-3">
        <div className="flex size-9 sm:size-10 items-center justify-center rounded-full bg-neutral-200 text-neutral-700 font-bold text-xs sm:text-sm overflow-hidden shrink-0">
          {review.buyer?.avatar?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={review.buyer.avatar.url}
              alt={buyerName}
              className="size-full object-cover"
            />
          ) : (
            <span>{buyerName.slice(0, 2).toUpperCase()}</span>
          )}
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-semibold text-neutral-900">
              {buyerName}
            </span>
            <span className="text-xs text-neutral-400">· {formattedDate}</span>
          </div>

          {/* 5 Gold Stars */}
          <div className="flex items-center text-[#FFAD33]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={cn(
                  "size-3.5",
                  review.rating > index
                    ? "fill-[#FFAD33] text-[#FFAD33]"
                    : "fill-neutral-200 text-neutral-200",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Review Comment Text */}
      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed pl-12 sm:pl-13">
        {review.comment}
      </p>
    </div>
  );
}

export default ReviewCard;
