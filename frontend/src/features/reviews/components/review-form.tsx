"use client";

import * as React from "react";
import Link from "next/link";
import { Star, Loader2, Send } from "lucide-react";
import { useCreateReview } from "@/features/reviews/hooks/use-reviews";
import { useCurrentUser } from "@/features/auth/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  productId: string;
}

export function ReviewForm({ productId }: ReviewFormProps) {
  const { data: user } = useCurrentUser();
  const [rating, setRating] = React.useState<number>(5);
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);
  const [comment, setComment] = React.useState<string>("");

  const createReviewMutation = useCreateReview(productId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      notify.info("Please log in to submit a review.");
      return;
    }

    if (!comment.trim()) {
      notify.error("Review comment cannot be empty.");
      return;
    }

    try {
      await createReviewMutation.mutateAsync({
        product: productId,
        rating,
        comment: comment.trim(),
      });
      notify.success("Thank you! Your review has been submitted.");
      setComment("");
      setRating(5);
    } catch (err: unknown) {
      notify.apiError(
        err,
        "Unable to submit review. You can only review products from delivered orders.",
      );
    }
  };

  if (!user) {
    return (
      <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 p-4 sm:p-6 text-center space-y-2">
        <p className="text-sm font-medium text-foreground">
          Have you purchased this product?
        </p>
        <p className="text-xs text-muted-foreground">
          Log in with your buyer account to share your feedback with other customers.
        </p>
        <div className="pt-2">
          <Link href="/login">
            <Button size="sm" variant="outline">
              Log in to Review
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-border/80 bg-card p-4 sm:p-5 space-y-4 shadow-xs"
    >
      <h3 className="text-sm font-bold text-foreground">Write a Review</h3>

      {/* Star Selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Your Rating:
        </span>
        <div
          className="flex items-center gap-1 cursor-pointer"
          onMouseLeave={() => setHoverRating(null)}
        >
          {Array.from({ length: 5 }).map((_, index) => {
            const starValue = index + 1;
            const isFilled =
              hoverRating !== null
                ? starValue <= hoverRating
                : starValue <= rating;

            return (
              <button
                key={starValue}
                type="button"
                onClick={() => setRating(starValue)}
                onMouseEnter={() => setHoverRating(starValue)}
                className="p-0.5 text-[#FFAD33] hover:scale-110 transition-transform"
                aria-label={`Rate ${starValue} stars`}
              >
                <Star
                  className={cn(
                    "size-5",
                    isFilled
                      ? "fill-[#FFAD33] text-[#FFAD33]"
                      : "fill-muted text-muted-foreground/30",
                  )}
                />
              </button>
            );
          })}
        </div>
        <span className="text-xs font-semibold text-foreground ml-1">
          {rating} / 5
        </span>
      </div>

      {/* Comment Area */}
      <div className="space-y-1">
        <textarea
          rows={3}
          maxLength={1000}
          placeholder="Share your experience with this product..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full rounded-md border border-border bg-background p-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
        />
        <div className="flex justify-end text-[11px] text-muted-foreground">
          {comment.length} / 1000
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          disabled={createReviewMutation.isPending || !comment.trim()}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          {createReviewMutation.isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="size-3.5" />
              <span>Submit Review</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
