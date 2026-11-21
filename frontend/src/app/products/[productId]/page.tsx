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
          <h2 className="text-xl font-bold text-foreground">
            Product Not Found
          </h2>
          <p className="text-sm text-muted-foreground">
            {error?.message ||
              "The requested product does not exist or may have been removed."}
          </p>
          <div className="pt-2">
            <Link href="/products">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="size-4" />
                <span>Back to Catalog</span>
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const categoryName = product.category?.name || "Products";
  const allImages = [
    ...(product.featureImage ? [product.featureImage] : []),
    ...(product.images ?? []),
  ];

  return (
    <div className="py-6 sm:py-10">
      <Container className="space-y-10">
        {/* Breadcrumb Navigation matching Figma */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap"
        >
          <Link href="/" className="hover:text-primary transition-colors">
            Account
          </Link>
          <ChevronRight className="size-3.5 opacity-50" />
          <Link
            href={`/products?category=${encodeURIComponent(
              product.category?._id || "",
            )}`}
            className="hover:text-primary transition-colors capitalize"
          >
            {categoryName}
          </Link>
          <ChevronRight className="size-3.5 opacity-50" />
          <span className="font-semibold text-foreground line-clamp-1 max-w-xs sm:max-w-md">
            {product.name}
          </span>
        </nav>

        {/* Top Product Hero (2 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery images={allImages} productName={product.name} />
          </div>

          {/* Right Column: Product Information & Purchase Controls */}
          <div className="lg:col-span-5">
            <ProductInfo product={product} />
          </div>
        </div>

        {/* Middle Section: Description matching Figma */}
        <section className="space-y-4 pt-6 border-t border-border/60">
          <div className="flex items-center gap-2">
            <span className="h-7 w-3 rounded-xs bg-primary inline-block" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Description
            </h2>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 leading-relaxed space-y-4">
            <p className="whitespace-pre-line">{product.description}</p>
          </div>
        </section>

        {/* Ratings & Reviews Section matching Figma */}
        <ReviewList productId={product._id} />

        {/* Related Products Section (Exactly 4 items) matching Figma */}
        <RelatedProducts productId={product._id} />
      </Container>
    </div>
  );
}
