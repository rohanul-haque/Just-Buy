"use client";

import * as React from "react";
import type { Product } from "@/features/products/types";
import { ProductCard } from "@/features/products/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  skeletonCount?: number;
  columns?: 3 | 4;
  className?: string;
}

export function ProductGrid({
  products,
  isLoading = false,
  skeletonCount = 4,
  columns = 4,
  className,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-2 gap-4 sm:gap-6",
          columns === 3
            ? "md:grid-cols-3"
            : "md:grid-cols-3 lg:grid-cols-4",
          className,
        )}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-square w-full rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-xs" />
            <Skeleton className="h-4 w-1/3 rounded-xs" />
            <Skeleton className="h-3 w-1/2 rounded-xs" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center">
        <p className="text-base font-medium text-foreground">
          No products found
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your search or filters to find what you are looking for.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 sm:gap-6",
        columns === 3
          ? "md:grid-cols-3"
          : "md:grid-cols-3 lg:grid-cols-4",
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
