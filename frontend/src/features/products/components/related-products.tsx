"use client";

import * as React from "react";
import { useRelatedProducts } from "@/features/products/hooks/use-products";
import { ProductGrid } from "@/features/products/components/product-grid";

interface RelatedProductsProps {
  productId: string;
}

export function RelatedProducts({ productId }: RelatedProductsProps) {
  const { data: products, isLoading } = useRelatedProducts(productId, 4);

  // If loading finished and no related products returned, hide section cleanly
  if (!isLoading && (!products || products.length === 0)) {
    return null;
  }

  return (
    <section className="space-y-6 pt-10 pb-6 border-t border-border/60">
      {/* Section Header matching Figma */}
      <div className="flex items-center gap-2">
        <span className="h-7 w-3 rounded-xs bg-primary inline-block" />
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
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

