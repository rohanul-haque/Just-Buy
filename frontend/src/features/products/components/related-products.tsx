"use client";

import * as React from "react";
import { useRelatedProducts } from "@/features/products/hooks/use-products";
import { ProductGrid } from "@/features/products/components/product-grid";

interface RelatedProductsProps {
  productId: string;
}

export function RelatedProducts({ productId }: RelatedProductsProps) {
  const { data: products, isLoading } = useRelatedProducts(productId, 4);

  // If loading finished and no related products returned, hide cleanly
  if (!isLoading && (!products || products.length === 0)) {
    return null;
  }

  return (
    <section className="space-y-6 pt-10 pb-6">
      {/* Section Header matching Mockup */}
      <div className="flex items-center gap-3">
        <span className="h-9 w-4 rounded-xs bg-[#ff6200] inline-block shrink-0" />
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
          Related Item
        </h2>
      </div>

      {/* Exactly 4 Related Products */}
      <ProductGrid
        products={products ?? []}
        isLoading={isLoading}
        skeletonCount={4}
        columns={4}
      />
    </section>
  );
}

export default RelatedProducts;
