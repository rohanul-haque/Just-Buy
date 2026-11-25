"use client";

import * as React from "react";
import Link from "next/link";
import { useNewArrivals } from "@/features/products/hooks/use-products";
import { ProductCard } from "@/features/products/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";

export function NewArrivalsSection() {
  const { data: products, isLoading } = useNewArrivals(4);

  return (
    <section className="py-10 sm:py-14 border-t border-gray-200">
      {/* Section Header */}
      <div className="space-y-3.5 mb-8">
        <div className="flex items-center gap-3">
          <span className="h-9 w-4 sm:w-5 rounded-[4px] bg-[#ff6200] inline-block shrink-0" />
          <span className="text-sm sm:text-base font-semibold text-[#ff6200] tracking-wide">
            This Month
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            New Arrival
          </h2>

          <Link href="/products">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md bg-[#ff6200] hover:bg-[#e55800] text-white font-medium px-8 sm:px-10 py-2.5 text-sm transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              View All
            </button>
          </Link>
        </div>
      </div>

      {/* 4 Products Row */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-neutral-200 rounded-xl p-3 sm:p-4 bg-white space-y-3">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4 rounded-sm" />
              <Skeleton className="h-4 w-1/3 rounded-sm" />
              <Skeleton className="h-3 w-1/2 rounded-sm" />
            </div>
          ))}
        </div>
      ) : !products || products.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-500">
          No new arrivals found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} showNewBadge={true} />
          ))}
        </div>
      )}
    </section>
  );
}

export default NewArrivalsSection;
