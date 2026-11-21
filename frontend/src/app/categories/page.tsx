"use client";

import * as React from "react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { CategoryCard } from "@/features/categories/components/category-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";

export default function CategoriesPage() {
  const { data: categories, isLoading, isError, error } = useCategories();

  return (
    <div className="py-8 sm:py-12">
      <Container className="space-y-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground"
        >
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="size-3.5 opacity-50" />
          <span className="font-semibold text-foreground">All Categories</span>
        </nav>

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-7 w-3 rounded-xs bg-primary inline-block" />
            <span className="text-xs sm:text-sm font-semibold text-primary tracking-wide">
              Categories
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Explore All Categories
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Browse our wide selection of departments and curated collections to find exactly what you need.
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center text-sm text-destructive">
            {error?.message || "Failed to load categories"}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {categories?.map((cat) => (
              <CategoryCard key={cat._id} category={cat} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
