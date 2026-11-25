"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/container";
import { useProductDetail } from "@/features/products/hooks/use-products";
import { ProductGallery } from "@/features/products/components/product-gallery";
import { ProductInfo } from "@/features/products/components/product-info";
import { RelatedProducts } from "@/features/products/components/related-products";
import { ReviewList } from "@/features/reviews/components/review-list";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface ProductPageProps {
  params: Promise<{ productId: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const unwrappedParams = React.use(params);
  const productId = unwrappedParams.productId;

  const { data: product, isLoading, isError, error } = useProductDetail(productId);

  if (isLoading) {
    return (
      <div className="py-8 sm:py-12">
        <Container className="space-y-8">
          <Skeleton className="h-6 w-60 rounded-xs" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <Skeleton className="aspect-square w-full rounded-lg" />
            </div>
            <div className="lg:col-span-5 space-y-4">
              <Skeleton className="h-8 w-3/4 rounded-xs" />
              <Skeleton className="h-4 w-1/3 rounded-xs" />
              <Skeleton className="h-6 w-1/4 rounded-xs" />
              <Skeleton className="h-20 w-full rounded-xs" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="py-16 text-center">
        <Container className="max-w-md space-y-4">
          <h2 className="text-xl font-bold text-neutral-900">
            Product Not Found
          </h2>
          <p className="text-sm text-neutral-600">
            {error?.message ||
              "The requested product does not exist or may have been removed."}
          </p>
          <div className="pt-2">
            <Link href="/products">
              <Button variant="outline" className="gap-2 cursor-pointer">
                <ArrowLeft className="size-4" />
                <span>Back to Catalog</span>
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const categoryName = product.category?.name || "Gaming";
  const allImages = [
    ...(product.featureImage ? [product.featureImage] : []),
    ...(product.images ?? []),
  ];

  return (
    <div className="py-6 sm:py-10 bg-white min-h-screen">
      <Container className="space-y-12 sm:space-y-16">
        {/* 1. Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500 flex-wrap"
        >
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="size-3.5 text-neutral-400" />
          <Link
            href={`/products?category=${encodeURIComponent(
              product.category?._id || "",
            )}`}
            className="hover:text-black transition-colors capitalize"
          >
            {categoryName}
          </Link>
          <ChevronRight className="size-3.5 text-neutral-400" />
          <span className="font-semibold text-neutral-900 line-clamp-1 max-w-xs sm:max-w-md">
            {product.name}
          </span>
        </nav>

        {/* 2. Top Product Area: Gallery (Left) + Product Info (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Image Gallery (Compact and balanced) */}
          <div className="lg:col-span-6 flex justify-center">
            <ProductGallery images={allImages} productName={product.name} />
          </div>

          {/* Right Column: Ordered Product Information */}
          <div className="lg:col-span-6">
            <ProductInfo product={product} />
          </div>
        </div>

        {/* 3. Related Products Section: Directly below product info */}
        <RelatedProducts productId={product._id} />

        {/* 4. Ratings & Reviews + Add Review Form at bottom */}
        <ReviewList productId={product._id} />
      </Container>
    </div>
  );
}
