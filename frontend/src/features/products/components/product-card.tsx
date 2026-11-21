"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Star, ShoppingCart, ImageOff, Loader2 } from "lucide-react";
import type { Product } from "@/features/products/types";
import { useCurrentUser } from "@/features/auth/hooks/use-auth";
import {
  useWishlist,
  useAddToWishlist,
  useRemoveFromWishlist,
} from "@/features/wishlist/hooks/use-wishlist";
import { useAddToCart } from "@/features/cart/hooks/use-cart";
import { cn } from "@/lib/utils";
import notify from "@/lib/toast";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { data: wishlist } = useWishlist();
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();
  const addToCartMutation = useAddToCart();

  const isWishlisted = Boolean(
    wishlist?.products?.some((p) => p._id === product._id),
  );

  const imageUrl = product.featureImage?.url || product.images?.[0]?.url;

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

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      notify.info("Please sign in to add items to your cart.");
      return;
    }

    // If product has size options, direct customer to product detail to choose size
    if (product.sizes && product.sizes.length > 1) {
      router.push(`/products/${product._id}`);
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        productId: product._id,
        quantity: 1,
        size: product.sizes?.[0],
      });
      notify.success("Added to cart", `${product.name} (1 item)`);
    } catch (err) {
      notify.apiError(err, "Failed to add to cart");
    }
  };

  const hasReviews = Boolean(
    product.numReviews && product.numReviews > 0 && product.rating,
  );

  return (
    <div
      className={cn(
        "group flex flex-col justify-between transition-all duration-200",
        className,
      )}
    >
      {/* Image Area with hover Add to Cart */}
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-[#F5F5F5] dark:bg-neutral-900 flex items-center justify-center p-4">
        {/* Wishlist Button */}
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
          className="absolute top-2.5 right-2.5 z-10 flex size-8 items-center justify-center rounded-full bg-white text-foreground shadow-xs transition hover:scale-110 hover:bg-neutral-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 cursor-pointer"
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
                  : "text-foreground group-hover/heart:text-red-500",
              )}
            />
          )}
        </button>

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
            <div className="flex size-full flex-col items-center justify-center text-muted-foreground">
              <ImageOff className="size-10 mb-1 opacity-50" />
              <span className="text-xs">No image</span>
            </div>
          )}
        </Link>

        {/* Add to Cart Bar on Hover */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={addToCartMutation.isPending}
          className="absolute inset-x-0 bottom-0 z-20 flex h-10 w-full items-center justify-center gap-2 bg-primary text-xs sm:text-sm font-semibold text-primary-foreground shadow-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:bg-primary/95 cursor-pointer disabled:opacity-50"
        >
          {addToCartMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ShoppingCart className="size-4" />
          )}
          <span>Add To Cart</span>
        </button>
      </div>

      {/* Info Area below image */}
      <div className="mt-3 flex flex-col gap-1.5">
        <Link
          href={`/products/${product._id}`}
          className="font-medium text-foreground hover:text-primary transition-colors text-sm sm:text-base line-clamp-1"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Price Row: Real Price Only */}
        <div className="flex items-center gap-2 font-semibold font-mono">
          <span className="text-primary text-sm sm:text-base">
            ${product.price.toFixed(2)}
          </span>
        </div>

        {/* Rating Row: Only if Real Reviews Exist */}
        <div className="flex items-center gap-1 min-h-[18px]">
          {hasReviews ? (
            <>
              <div className="flex items-center text-[#FFAD33]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      "size-3.5",
                      index < Math.floor(product.rating!)
                        ? "fill-[#FFAD33] text-[#FFAD33]"
                        : "fill-muted text-muted-foreground/30",
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-medium ml-1">
                ({product.numReviews})
              </span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">
              (No reviews yet)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
