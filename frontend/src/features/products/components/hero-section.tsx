"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, ShoppingCart, ArrowRight } from "lucide-react";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { Skeleton } from "@/components/ui/skeleton";

export function HeroSection() {
  const { data: categories, isLoading } = useCategories();

  const hasCategories = Boolean(categories && categories.length > 0);

  return (
    <section className="pt-4 pb-8 sm:pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Category Sidebar - Desktop: ONLY actual API categories */}
        <aside className="hidden lg:block lg:col-span-3 border-r border-border pr-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-full rounded-sm" />
              ))}
            </div>
          ) : hasCategories ? (
            <nav className="flex flex-col space-y-1">
              {categories!.slice(0, 9).map((cat) => (
                <Link
                  key={cat._id}
                  href={`/products?category=${encodeURIComponent(cat._id)}`}
                  className="group flex items-center justify-between py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                >
                  <span className="capitalize">{cat.name}</span>
                  <ChevronRight className="size-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </nav>
          ) : (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No categories available
            </div>
          )}
        </aside>

        {/* Right Promo Banner matching Figma */}
        <div className={hasCategories ? "lg:col-span-9" : "lg:col-span-12"}>
          <div className="relative overflow-hidden rounded-2xl bg-neutral-950 text-white min-h-[300px] sm:min-h-[360px] md:min-h-[390px] flex items-center p-6 sm:p-10 lg:p-12 shadow-sm">
            {/* Background Graphic Elements */}
            <div className="absolute -top-12 -right-12 size-72 sm:size-96 rounded-full bg-amber-400/90 blur-xs pointer-events-none" />
            <div className="absolute -bottom-20 right-48 size-60 rounded-full bg-amber-300/80 blur-xs pointer-events-none hidden sm:block" />
            <div className="absolute top-1/2 left-1/3 -translate-y-1/2 size-40 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />

            {/* Content Area */}
            <div className="relative z-10 max-w-lg space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-400/30">
                <span>JustBuy Marketplace</span>
              </div>

              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-amber-400 font-bold block">
                  Authentic Verified Vendors
                </span>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-none">
                  SHOP <br className="hidden sm:inline" />
                  <span className="text-amber-400">ONLINE</span>
                </h1>
              </div>

              <p className="text-sm sm:text-base text-neutral-300 max-w-sm line-clamp-2">
                Discover authentic products from verified vendors across the country.
              </p>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-md bg-amber-400 px-6 py-3 text-sm font-bold text-neutral-950 transition hover:bg-amber-300 shadow-md active:scale-95"
                >
                  <ShoppingCart className="size-4" />
                  <span>Shop Now</span>
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/categories"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 underline-offset-4 hover:underline hover:text-white"
                >
                  <span>All Categories</span>
                </Link>
              </div>
            </div>

            {/* Decorative Shopping Cart Silhouette */}
            <div className="absolute right-8 sm:right-16 md:right-24 bottom-6 sm:bottom-10 pointer-events-none opacity-20 sm:opacity-30">
              <ShoppingCart className="size-44 sm:size-60 md:size-72 text-amber-950 stroke-[1.2]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
