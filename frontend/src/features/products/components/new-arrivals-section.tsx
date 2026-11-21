"use client";

import * as React from "react";
import Link from "next/link";
import { useNewArrivals } from "@/features/products/hooks/use-products";
import { ProductGrid } from "@/features/products/components/product-grid";
import { Button } from "@/components/ui/button";

export function NewArrivalsSection() {
  const { data: products, isLoading } = useNewArrivals(4);

  return (
    <section className="space-y-6 py-6 sm:py-8 border-t border-border/60">
      {/* Header matching Figma */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="h-7 w-3 rounded-xs bg-primary inline-block" />
          <span className="text-xs sm:text-sm font-semibold text-primary tracking-wide">
            This Month
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            New Arrival
          </h2>

          <Link href="/products">
            <Button className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6">
              View All
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Products Row */}
      <ProductGrid
        products={products ?? []}
        isLoading={isLoading}
        skeletonCount={4}
        columns={4}
      />
    </section>
  );
}
