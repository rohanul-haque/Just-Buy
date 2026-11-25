"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Star, Heart, Minus, Plus, Loader2 } from "lucide-react";
import type { Product, ProductSize } from "@/features/products/types";
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
    if (quantity >= product.stock) {
      notify.warning(`Cannot select more than available stock (${product.stock} available)`);
      return;
    }
    setQuantity((q) => Math.min(product.stock, q + 1));
  };

  const handleBuyNow = async () => {
    if (!user) {
      notify.info("Please sign in to complete your purchase.");
      router.push("/login");
      return;
    }

    if (hasSizes && !selectedSize) {
      notify.warning("Please select a size first.");
      return;
    }

    if (quantity > product.stock) {
      notify.error(`Cannot purchase more than available stock (${product.stock} available).`);
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

  // Real reviews calculation from backend reviews API
  const reviewsCount = reviews?.length ?? 0;
  const ratingValue =
    reviewsCount > 0
      ? reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
      : 0;

  const isInStock = product.stock > 0;

  // Dynamically resolve vendor name strictly from backend data (no static fallback)
  const vendorName =
    product.vendor?.shopName ||
    (product.vendor?.vendor && typeof product.vendor.vendor === "object"
      ? product.vendor.vendor.name
      : undefined) ||
    product.vendor?.name;

  return (
    <div className="flex flex-col space-y-4 sm:space-y-5">
      {/* 1. Title */}
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 leading-snug">
        {product.name}
      </h1>

      {/* 2. Vendor Name strictly from Backend */}
      {vendorName && (
        <p className="text-base sm:text-lg font-semibold text-[#ff6200]">
          {vendorName}
        </p>
      )}

      {/* 3. Reviews & Stock Status */}
      <div className="flex items-center gap-3 text-xs sm:text-sm">
        <div className="flex items-center text-[#FFAD33]">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={cn(
                "size-4",
                ratingValue > index
                  ? "fill-[#FFAD33] text-[#FFAD33]"
                  : "fill-neutral-200 text-neutral-200",
              )}
            />
          ))}
        </div>

        <span className="text-neutral-500 font-medium">
          ({reviewsCount} Reviews)
        </span>

        <span className="text-neutral-300">|</span>

        <span
          className={cn(
            "font-semibold text-xs sm:text-sm",
            isInStock ? "text-[#00D672]" : "text-red-500",
          )}
        >
          {isInStock ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      {/* 4. Price */}
      <div className="text-2xl sm:text-3xl font-bold text-neutral-900">
        ${product.price.toFixed(2)}
      </div>

      {/* 5. Description */}
      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-lg">
        {product.description}
      </p>

      {/* 6. Size: Displayed ONLY if sizes exist in product */}
      {hasSizes && (
        <div className="pt-2 border-t border-neutral-200/80">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-neutral-900">Size:</span>
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
                        ? "bg-[#ff6200] text-white shadow-xs"
                        : "border border-neutral-300 bg-white text-neutral-800 hover:border-[#ff6200] hover:text-[#ff6200]",
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

      {/* 7. Action Row: Perfectly Symmetric Increment/Decrement Button + Buy Now + Wishlist */}
      <div className="flex items-center gap-3 sm:gap-4 pt-3 flex-wrap">
        {/* Quantity Selector: Exact 44px (h-11) height, square buttons with equal horizontal/vertical proportions */}
        <div className="inline-flex items-center h-11 rounded-md border border-neutral-300 bg-white overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="w-11 h-11 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 disabled:opacity-35 transition-colors cursor-pointer shrink-0 border-r border-neutral-300"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-12 h-11 flex items-center justify-center text-sm sm:text-base font-semibold text-neutral-900 select-none">
            {quantity}
          </span>
          <button
            type="button"
            onClick={handleIncrease}
            disabled={!isInStock || quantity >= product.stock}
            aria-label="Increase quantity"
            className={cn(
              "w-11 h-11 flex items-center justify-center bg-[#ff6200] text-white transition-colors shrink-0",
              !isInStock || quantity >= product.stock
                ? "opacity-40 cursor-not-allowed bg-neutral-400"
                : "hover:bg-[#e65800] cursor-pointer",
            )}
          >
            <Plus className="size-4" />
          </button>
        </div>

        {/* Stock warning hint if max stock reached */}
        {quantity >= product.stock && isInStock && (
          <span className="text-xs text-amber-600 font-medium block w-full">
            Maximum available stock reached ({product.stock} available)
          </span>
        )}

        {/* Buy Now Button */}
        <button
          type="button"
          disabled={!isInStock || addToCartMutation.isPending}
          onClick={handleBuyNow}
          className="h-11 px-8 sm:px-10 rounded-md bg-[#ff6200] hover:bg-[#e65800] text-white font-semibold text-sm transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center"
        >
          {addToCartMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Buy Now"
          )}
        </button>

        {/* Wishlist Button: Matching exact h-11 height and w-11 width */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          disabled={
            addToWishlistMutation.isPending ||
            removeFromWishlistMutation.isPending
          }
          className={cn(
            "size-11 rounded-md border border-neutral-300 hover:border-[#ff6200] flex items-center justify-center text-neutral-700 hover:text-[#ff6200] transition-colors cursor-pointer shrink-0 bg-white shadow-2xs",
            isWishlisted && "border-red-500 text-red-500 bg-red-50",
          )}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {addToWishlistMutation.isPending ||
          removeFromWishlistMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Heart
              className={cn(
                "size-5 transition-colors",
                isWishlisted && "fill-red-500 text-red-500",
              )}
            />
          )}
        </button>
      </div>
    </div>
  );
}

export default ProductInfo;
