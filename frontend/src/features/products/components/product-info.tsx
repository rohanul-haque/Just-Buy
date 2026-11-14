"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Star, Heart, ShoppingCart, Minus, Plus, Loader2 } from "lucide-react";
import type { Product, ProductSize } from "@/features/products/types";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/auth/hooks/use-auth";
import { useProductReviews } from "@/features/reviews/hooks/use-reviews";
import {
  useWishlist,
  useAddToWishlist,
  useRemoveFromWishlist,
} from "@/features/wishlist/hooks/use-wishlist";
import { useAddToCart } from "@/features/cart/hooks/use-cart";
import notify from "@/lib/toast";
import { cn } from "@/lib/utils";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { data: reviews } = useProductReviews(product._id);
  const { data: wishlist } = useWishlist();

  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();
  const addToCartMutation = useAddToCart();

  const hasSizes = Boolean(product.sizes && product.sizes.length > 0);
  const [selectedSize, setSelectedSize] = React.useState<ProductSize | undefined>(
    hasSizes ? product.sizes![0] : undefined,
  );
  const [quantity, setQuantity] = React.useState<number>(1);

  const isWishlisted = Boolean(
    wishlist?.products?.some((p) => p._id === product._id),
  );

  const handleDecrease = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  const handleIncrease = () => {
    setQuantity((q) => Math.min(product.stock || 99, q + 1));
  };

  const handleAddToCart = async () => {
    if (!user) {
      notify.info("Please sign in to add items to your cart.");
      router.push("/login");
      return;
    }

    if (hasSizes && !selectedSize) {
      notify.warning("Please select a size first.");
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        productId: product._id,
        quantity,
        size: selectedSize,
      });
      notify.success("Added to cart", `${product.name} (${quantity} item${quantity > 1 ? "s" : ""})`);
    } catch (err) {
      notify.apiError(err, "Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      notify.info("Please sign in to purchase items.");
      router.push("/login");
      return;
    }

    if (hasSizes && !selectedSize) {
      notify.warning("Please select a size first.");
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        productId: product._id,
        quantity,
        size: selectedSize,
      });
      router.push("/cart");
    } catch (err) {
      notify.apiError(err, "Failed to proceed to checkout");
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      notify.info("Please sign in to manage your wishlist.");
      router.push("/login");
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

  // Real review data derived from actual reviews API
  const reviewsCount = reviews?.length ?? 0;
  const ratingValue =
    reviewsCount > 0
      ? reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
      : 0;

  const isInStock = product.stock > 0;

  return (
    <div className="flex flex-col space-y-5">
      {/* Product Title */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {product.name}
        </h1>

        {/* Vendor Shop Name */}
        {product.vendor?.shopName && (
          <p className="text-sm font-semibold text-primary">
            {product.vendor.shopName}
          </p>
        )}
      </div>

      {/* Ratings and Stock Status */}
      <div className="flex items-center gap-3 text-xs sm:text-sm">
        {reviewsCount > 0 ? (
          <>
            <div className="flex items-center text-[#FFAD33]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={cn(
                    "size-4",
                    index < Math.floor(ratingValue)
                      ? "fill-[#FFAD33] text-[#FFAD33]"
                      : "fill-muted text-muted-foreground/30",
                  )}
                />
              ))}
            </div>

            <span className="text-muted-foreground font-medium">
              ({reviewsCount} {reviewsCount === 1 ? "Review" : "Reviews"})
            </span>
          </>
        ) : (
          <span className="text-muted-foreground font-medium">
            (No reviews yet)
          </span>
        )}

        <span className="text-muted-foreground/40">|</span>

        {/* Real Stock Status */}
        <span
          className={cn(
            "font-semibold",
            isInStock ? "text-emerald-500" : "text-destructive",
          )}
        >
          {isInStock ? `In Stock (${product.stock} available)` : "Out of Stock"}
        </span>
      </div>

      {/* Price */}
      <div className="text-2xl sm:text-3xl font-bold text-foreground font-mono">
        ${product.price.toFixed(2)}
      </div>

      {/* Description */}
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
        {product.description}
      </p>

      {/* Brand */}
      {product.brand && (
        <div className="text-xs sm:text-sm text-foreground">
          <span className="font-semibold text-muted-foreground">Brand: </span>
          <span className="font-medium">{product.brand}</span>
        </div>
      )}

      {/* Size Selector: Displayed ONLY when sizes exist in actual backend data */}
      {hasSizes && (
        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-foreground">Size:</span>
            <div className="flex items-center gap-2">
              {product.sizes!.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "flex size-8 sm:size-9 items-center justify-center rounded-xs text-xs font-bold transition-all cursor-pointer",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "border border-border bg-background text-foreground hover:border-primary hover:text-primary",
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quantity & Action Row */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
        {/* Quantity Counter: [-] [ 1 ] [+] */}
        <div className="flex items-center rounded-md border border-border bg-background overflow-hidden">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="flex size-9 items-center justify-center text-foreground hover:bg-muted disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="w-10 text-center text-sm font-semibold text-foreground">
            {quantity}
          </span>
          <button
            type="button"
            onClick={handleIncrease}
            disabled={!isInStock || quantity >= product.stock}
            aria-label="Increase quantity"
            className="flex size-9 items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Plus className="size-3.5" />
          </button>
        </div>

        {/* Buy Now Button */}
        <Button
          size="lg"
          disabled={!isInStock || addToCartMutation.isPending}
          onClick={handleBuyNow}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 shadow-sm cursor-pointer"
        >
          {addToCartMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Buy Now"
          )}
        </Button>

        {/* Add To Cart Icon Button */}
        <Button
          variant="outline"
          size="icon"
          disabled={!isInStock || addToCartMutation.isPending}
          onClick={handleAddToCart}
          className="size-10 rounded-md border-border hover:border-primary hover:text-primary cursor-pointer"
          aria-label="Add to cart"
        >
          {addToCartMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ShoppingCart className="size-4" />
          )}
        </Button>

        {/* Wishlist Icon Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleToggleWishlist}
          disabled={
            addToWishlistMutation.isPending ||
            removeFromWishlistMutation.isPending
          }
          className={cn(
            "size-10 rounded-md border-border hover:border-primary transition-colors cursor-pointer",
            isWishlisted && "border-red-500 text-red-500 bg-red-500/5",
          )}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {addToWishlistMutation.isPending ||
          removeFromWishlistMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Heart
              className={cn(
                "size-4",
                isWishlisted && "fill-red-500 text-red-500",
              )}
            />
          )}
        </Button>
      </div>
    </div>
  );
}
