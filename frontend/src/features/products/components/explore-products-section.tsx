"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useExploreProducts } from "@/features/products/hooks/use-products";
import { ProductGrid } from "@/features/products/components/product-grid";
import { Button } from "@/components/ui/button";

export function ExploreProductsSection() {
  const { data: products, isLoading } = useExploreProducts(8);

  return (
    <section className="space-y-6 py-6 sm:py-8 border-t border-border/60">
      {/* Header matching Figma */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="h-7 w-3 rounded-xs bg-primary inline-block" />
          <span className="text-xs sm:text-sm font-semibold text-primary tracking-wide">
            Our Products
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Explore Our Products
          </h2>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-9 rounded-full bg-muted/40 hover:bg-muted"
              aria-label="Previous items"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              size="icon"
              className="size-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
              aria-label="Next items"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Exactly 8 Products (2 rows of 4) */}
      <ProductGrid
        products={products ?? []}
        isLoading={isLoading}
        skeletonCount={8}
        columns={4}
      />

      {/* Centered Button matching Figma */}
      <div className="pt-4 flex justify-center">
        <Link href="/products">
          <Button
            size="lg"
            className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 sm:px-12 py-3"
          >
            View All Products
          </Button>
        </Link>
      </div>
    </section>
  );
}
