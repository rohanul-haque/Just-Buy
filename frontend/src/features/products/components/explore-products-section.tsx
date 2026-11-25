"use client";

import * as React from "react";
import Link from "next/link";
import { useExploreProducts } from "@/features/products/hooks/use-products";
import { ProductGrid } from "@/features/products/components/product-grid";

export function ExploreProductsSection() {
  const { data: products, isLoading } = useExploreProducts(8, 4);

  return (
    <section className="space-y-6 sm:space-y-8 py-6 sm:py-10">
      {/* Header matching Mockup */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="h-8 w-4 rounded-xs bg-[#fe6201] inline-block" />
          <span className="text-xs sm:text-sm font-semibold text-[#fe6201] tracking-wide">
            Our Products
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            Explore Our Products
          </h2>
        </div>
      </div>

      {/* 8 Products (2 rows of 4, skipping latest 4) */}
      <ProductGrid
        products={(products ?? []).slice(0, 8)}
        isLoading={isLoading}
        skeletonCount={8}
        columns={4}
      />

      {/* Centered Button matching New Arrival button consistency */}
      <div className="pt-6 sm:pt-8 flex justify-center">
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-md bg-[#ff6200] hover:bg-[#e55800] text-white font-medium px-8 sm:px-10 py-2.5 text-sm transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          View All
        </Link>
      </div>
    </section>
  );
}

export default ExploreProductsSection;
