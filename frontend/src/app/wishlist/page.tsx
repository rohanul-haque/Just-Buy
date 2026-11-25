"use client";

import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/features/auth/hooks/use-auth";
import { ProductCard } from "@/features/products/components/product-card";
import {
  useRemoveFromWishlist,
  useWishlist,
} from "@/features/wishlist/hooks/use-wishlist";
import notify from "@/lib/toast";
import { ArrowRight, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import Link from "next/link";
import * as React from "react";

export default function WishlistPage() {
  const { data: user, isLoading: isAuthLoading } = useCurrentUser();
  const { data: wishlist, isLoading: isWishlistLoading } = useWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();

  const [page, setPage] = React.useState(1);
  const limit = 8; // 8 items per page

  // Real database wishlist products only — no fake/sample products
  const productsToDisplay = wishlist?.products ?? [];

  // Pagination calculation
  const totalItems = productsToDisplay.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * limit;
  const paginatedProducts = productsToDisplay.slice(
    startIndex,
    startIndex + limit,
  );

  const handleRemove = async (productId: string, productName: string) => {
    try {
      await removeFromWishlistMutation.mutateAsync(productId);
      notify.success("Removed from wishlist", productName);
    } catch (err) {
      notify.apiError(err, "Failed to remove from wishlist");
    }
  };

  if (isAuthLoading || (user && isWishlistLoading)) {
    return (
      <div className="pt-6 sm:pt-8 pb-12 sm:pb-16 bg-white min-h-[calc(100vh-4rem)]">
        <Container className="space-y-5 sm:space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-9 w-32 rounded-xs" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="border border-neutral-200 rounded-xl p-3 sm:p-4 bg-white space-y-3"
              >
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4 rounded-xs" />
                <Skeleton className="h-4 w-1/3 rounded-xs" />
                <Skeleton className="h-3 w-1/2 rounded-xs" />
              </div>
            ))}
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="pt-6 sm:pt-8 pb-12 sm:pb-16 bg-white min-h-[calc(100vh-4rem)]">
      <Container className="space-y-5 sm:space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-base sm:text-lg font-medium text-neutral-900 tracking-tight">
            Wishlist ({totalItems})
          </h1>

          <Link
            href="/products"
            className="border border-[#ff6200] text-[#ff6200] hover:bg-[#ff6200] hover:text-white transition-colors px-5 sm:px-6 py-2 sm:py-2.5 rounded-xs text-xs sm:text-sm font-medium cursor-pointer select-none inline-flex items-center justify-center"
          >
            Move To Shop
          </Link>
        </div>

        {/* Empty State when wishlist is empty */}
        {totalItems === 0 ? (
          <div className="w-full border border-neutral-200 rounded-2xl bg-white py-10 sm:py-14 px-6 sm:px-8 text-center flex flex-col items-center justify-center shadow-xs">
            <div className="size-14 sm:size-16 rounded-full bg-orange-50 text-[#ff6200] flex items-center justify-center mb-4">
              <Heart className="size-7 sm:size-8 stroke-[1.5]" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
              {!user
                ? "Please Sign In to View Your Wishlist"
                : "Your Wishlist is Empty"}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1.5 mb-6 leading-relaxed max-w-sm">
              {!user
                ? "Your wishlist is tied to your account. Sign in to access your saved items and favorite products."
                : "You haven't added any products to your wishlist yet. Explore our products and add your favorite items!"}
            </p>
            <Link
              href={!user ? "/login" : "/products"}
              className="bg-[#ff6200] hover:bg-[#e65800] text-white px-7 py-2.5 rounded-xs text-xs sm:text-sm font-medium transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>{!user ? "Sign In" : "Move To Shop"}</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Product Cards Grid with Card-style White Bordered Cards and Trash Icon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  actionType="delete"
                  onDelete={() => handleRemove(product._id, product.name)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-10 sm:pt-14">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage <= 1}
                  className="size-9 rounded-sm border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="size-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setPage(pageNum)}
                      className={`size-9 rounded-sm text-sm font-medium transition-colors cursor-pointer flex items-center justify-center ${
                        currentPage === pageNum
                          ? "bg-[#ff6200] text-white"
                          : "border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  className="size-9 rounded-sm border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label="Next Page"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
