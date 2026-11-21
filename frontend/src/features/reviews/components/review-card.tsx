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
      const date = new Date(review.createdAt);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  }, [review.createdAt]);

  return (
    <div className={cn("space-y-2 py-4 border-b border-border/50", className)}>
      <div className="flex items-center justify-between gap-4">
        {/* User Info matching Figma */}
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground font-semibold text-xs overflow-hidden">
            {review.buyer.avatar?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={review.buyer.avatar.url}
                alt={review.buyer.name}
                className="size-full object-cover"
              />
            ) : (
              <span>
                {review.buyer.name
                  ? review.buyer.name.slice(0, 2).toUpperCase()
                  : "U"}
              </span>
            )}
          </div>

          <div>
            <span className="text-sm font-semibold text-foreground block">
              {review.buyer.name || "Anonymous Buyer"}
            </span>
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
          </div>
        </div>

        {/* 5 Star Rating */}
        <div className="flex items-center text-[#FFAD33]">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={cn(
                "size-3.5",
                index < review.rating
                  ? "fill-[#FFAD33] text-[#FFAD33]"
                  : "fill-muted text-muted-foreground/30",
              )}
            />
          ))}
        </div>
      </div>

      {/* Review Comment */}
      <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed pl-12">
        {review.comment}
      </p>
    </div>
  );
}
