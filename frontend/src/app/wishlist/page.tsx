"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Trash2, Heart, ShoppingCart, ShoppingBag } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useCurrentUser } from "@/features/auth/hooks/use-auth";
import {
  useWishlist,
  useRemoveFromWishlist,
} from "@/features/wishlist/hooks/use-wishlist";
import { useAddToCart } from "@/features/cart/hooks/use-cart";
import notify from "@/lib/toast";

export default function WishlistPage() {
  const { data: user, isLoading: isAuthLoading } = useCurrentUser();
  const { data: wishlist, isLoading: isWishlistLoading } = useWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();
  const addToCartMutation = useAddToCart();

  const handleRemove = async (productId: string, productName: string) => {
    try {
      await removeFromWishlistMutation.mutateAsync(productId);
      notify.success("Removed from wishlist", productName);
    } catch (err) {
      notify.apiError(err, "Failed to remove from wishlist");
    }
  };

  const handleMoveToCart = async (productId: string, productName: string) => {
    try {
      await addToCartMutation.mutateAsync({ productId, quantity: 1 });
      await removeFromWishlistMutation.mutateAsync(productId);
      notify.success("Moved to cart", `${productName} (1 item)`);
    } catch (err) {
      notify.apiError(err, "Failed to move item to cart");
    }
  };

  const products = wishlist?.products ?? [];

  if (isAuthLoading || (user && isWishlistLoading)) {
    return (
      <div className="py-8 sm:py-12">
        <Container className="space-y-6">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-10">
      <Container className="space-y-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground"
        >
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="size-3.5 opacity-50" />
          <span className="font-semibold text-foreground">Wishlist</span>
        </nav>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-7 w-3 rounded-xs bg-primary inline-block" />
              <span className="text-xs sm:text-sm font-semibold text-primary tracking-wide">
                Wishlist
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Your Wishlist ({products.length})
            </h1>
          </div>
        </div>

        {!user ? (
          <EmptyState
            icon={<Heart className="size-8" />}
            title="Please sign in to view your wishlist"
            description="Your saved items are linked to your buyer profile. Sign in to access them anytime."
            actionLabel="Sign In"
            actionHref="/login"
          />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Heart className="size-8" />}
            title="Your Wishlist Is Empty"
            description="Save items you want to buy later by tapping the heart icon on any product."
            actionLabel="Explore Products"
            actionHref="/products"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => {
              const imageUrl = product.featureImage?.url;

              return (
                <div
                  key={product._id}
                  className="group flex flex-col justify-between rounded-lg border border-border/80 bg-card p-3 shadow-2xs hover:shadow-xs transition-all"
                >
                  <div className="relative aspect-square w-full rounded-md bg-[#F5F5F5] dark:bg-neutral-900 overflow-hidden flex items-center justify-center p-3">
                    <button
                      type="button"
                      onClick={() => handleRemove(product._id, product.name)}
                      disabled={removeFromWishlistMutation.isPending}
                      className="absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-full bg-white text-muted-foreground shadow-xs hover:text-destructive hover:bg-neutral-50 dark:bg-neutral-800 transition"
                      aria-label={`Remove ${product.name} from wishlist`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>

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
                          className="object-contain p-1 transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <ShoppingBag className="size-8 text-muted-foreground opacity-40" />
                      )}
                    </Link>
                  </div>

                  <div className="mt-3 space-y-2">
                    <Link
                      href={`/products/${product._id}`}
                      className="font-medium text-foreground hover:text-primary transition-colors text-xs sm:text-sm line-clamp-1"
                      title={product.name}
                    >
                      {product.name}
                    </Link>

                    <div className="text-primary font-bold text-sm sm:text-base font-mono">
                      ${product.price.toFixed(2)}
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleMoveToCart(product._id, product.name)}
                      disabled={addToCartMutation.isPending}
                      className="w-full gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    >
                      <ShoppingCart className="size-3.5" />
                      <span>Move to Cart</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}

