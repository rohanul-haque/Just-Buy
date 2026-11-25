"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ImageOff, Loader2, Star, Trash2 } from "lucide-react";
import type { Product } from "@/features/products/types";
import type { WishlistProduct } from "@/features/wishlist/types";
import { useCurrentUser } from "@/features/auth/hooks/use-auth";
import { useProductReviews } from "@/features/reviews/hooks/use-reviews";
import {
  useWishlist,
  useAddToWishlist,
  useRemoveFromWishlist,
} from "@/features/wishlist/hooks/use-wishlist";
import { cn } from "@/lib/utils";
import notify from "@/lib/toast";

interface ProductCardProps {
  product: Product | WishlistProduct;
  className?: string;
  showNewBadge?: boolean;
  actionType?: "wishlist" | "delete";
  onDelete?: () => void;
}

export function ProductCard({
  product,
  className,
  showNewBadge = false,
  actionType = "wishlist",
  onDelete,
}: ProductCardProps) {
  const { data: user } = useCurrentUser();
  const { data: wishlist } = useWishlist();
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();

  // Fetch real reviews from backend API for this product
  const isSample = product._id.startsWith("sample-");
  const { data: reviews } = useProductReviews(isSample ? "" : product._id);

  const numReviews =
    reviews !== undefined && reviews.length > 0
      ? reviews.length
      : (product.numReviews ?? (isSample ? 65 : 0));

  const rating =
    reviews !== undefined && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : (product.rating ?? (isSample ? 5 : 0));

  const isWishlisted = Boolean(
    wishlist?.products?.some((p) => p._id === product._id),
  );

  const imageUrl =
    product.featureImage?.url ||
    ((product as Product).images && (product as Product).images?.[0]?.url);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      notify.info("Please sign in to save items to your wishlist.");
      return;
    }

    try {
      if (isWishlisted) {
        await removeFromWishlistMutation.mutateAsync(product._id);
        notify.info("Removed from wishlist", product.name);
      } else {
        await addToWishlistMutation.mutateAsync(product._id);
        notify.success("Added to wishlist", product.name);
      }
    } catch (err) {
      notify.apiError(err, "Failed to update wishlist");
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div
      className={cn(
        "group flex flex-col justify-between border border-neutral-200 rounded-xl p-3 sm:p-4 bg-white transition-all duration-200 hover:shadow-xs relative",
        className,
      )}
    >
      {/* Image Area with no background / transparent */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-transparent flex items-center justify-center p-2">
        {/* NEW Badge: only shown when showNewBadge is true */}
        {showNewBadge && (
          <span className="absolute top-2 left-2 z-10 bg-[#00D672] text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-xs shadow-2xs">
            NEW
          </span>
        )}

        {/* Top-Right Action Button: Delete button (Wishlist) or Heart button (Explore/New Arrivals) */}
        {actionType === "delete" ? (
          <button
            type="button"
            onClick={handleDelete}
            aria-label={`Remove ${product.name} from wishlist`}
            className="absolute top-2 right-2 z-10 flex size-8 items-center justify-center rounded-full bg-white border border-neutral-200/80 text-gray-700 hover:text-red-500 hover:bg-red-50 shadow-2xs transition cursor-pointer"
          >
            <Trash2 className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleWishlist}
            disabled={
              addToWishlistMutation.isPending ||
              removeFromWishlistMutation.isPending
            }
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
            className="absolute top-2 right-2 z-10 flex size-8 items-center justify-center rounded-full bg-white border border-neutral-200/80 text-gray-700 shadow-2xs transition hover:scale-105 hover:bg-neutral-50 cursor-pointer"
          >
            {addToWishlistMutation.isPending ||
            removeFromWishlistMutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
            ) : (
              <Heart
                className={cn(
                  "size-4 transition-colors",
                  isWishlisted
                    ? "fill-red-500 text-red-500"
                    : "text-gray-700 group-hover:text-red-500",
                )}
              />
            )}
          </button>
        )}

        {/* Product Image Link */}
        <Link
          href={`/products/${product._id}`}
          className="relative size-full flex items-center justify-center"
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              unoptimized
              className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center text-gray-400">
              <ImageOff className="size-10 mb-1 opacity-50" />
              <span className="text-xs">No image</span>
            </div>
          )}
        </Link>
      </div>

      {/* Info Area below image: Name, Price, and Rating/Reviews */}
      <div className="mt-3 flex flex-col gap-1">
        <Link
          href={`/products/${product._id}`}
          className="font-semibold text-neutral-900 hover:text-[#ff6200] transition-colors text-sm sm:text-base truncate"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Price Row: Real Price */}
        <div className="flex items-center gap-2">
          <span className="text-[#ff6200] font-bold text-base sm:text-lg">
            ${product.price}
          </span>
        </div>

        {/* Rating Row: Reviews */}
        <div className="flex items-center gap-1 mt-0.5">
          <div className="flex items-center text-[#FFAD33]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={cn(
                  "size-3.5",
                  rating > index
                    ? "fill-[#FFAD33] text-[#FFAD33]"
                    : "fill-neutral-200 text-neutral-200",
                )}
              />
            ))}
          </div>
          <span className="text-xs text-neutral-400 font-medium ml-1">
            ({numReviews})
          </span>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
