"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ProductFilters } from "@/features/products/components/product-filters";
import { ProductGrid } from "@/features/products/components/product-grid";
import { usePublicProducts } from "@/features/products/hooks/use-products";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ProductsContent() {
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = React.useState(
    searchParams.get("search") || "",
  );
  const [debouncedSearch, setDebouncedSearch] = React.useState(searchQuery);

  const [selectedCategory, setSelectedCategory] = React.useState<
    string | undefined
  >(searchParams.get("category") || undefined);

  const [selectedPriceTier, setSelectedPriceTier] = React.useState<
    string | undefined
  >(undefined);
  const [minPrice, setMinPrice] = React.useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = React.useState<number | undefined>(undefined);
  const [budgetInput, setBudgetInput] = React.useState<string>("");

  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle budget input
  const handleBudgetChange = (budget: string) => {
    setBudgetInput(budget);
    setSelectedPriceTier(undefined);
    const parsed = Number(budget);
    if (!isNaN(parsed) && parsed > 0) {
      setMinPrice(0);
      setMaxPrice(parsed);
    } else {
      setMinPrice(undefined);
      setMaxPrice(undefined);
    }
  };

  const handleSelectPriceTier = (
    tierLabel?: string,
    min?: number,
    max?: number,
  ) => {
    setSelectedPriceTier(tierLabel);
    setBudgetInput("");
    setMinPrice(min);
    setMaxPrice(max);
  };

  const handleSelectCategory = (categoryId?: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedCategory(undefined);
    setSelectedPriceTier(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setBudgetInput("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Fetch paginated products using strictly backend-supported query parameters
  const { data, isLoading } = usePublicProducts({
    page: currentPage,
    limit: 15,
    search: debouncedSearch.trim() || undefined,
    category: selectedCategory,
  });

  const rawProducts = React.useMemo(() => data?.data ?? [], [data?.data]);

  // Client-side price filtering (without breaking backend query schema)
  const products = React.useMemo(() => {
    if (minPrice === undefined && maxPrice === undefined) {
      return rawProducts;
    }
    return rawProducts.filter((p) => {
      if (minPrice !== undefined && p.price < minPrice) return false;
      if (maxPrice !== undefined && p.price > maxPrice) return false;
      return true;
    });
  }, [rawProducts, minPrice, maxPrice]);

  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const totalCount = pagination?.total ?? rawProducts.length;

  return (
    <div className="py-6 sm:py-10">
      <Container className="space-y-8">
        {/* Top Header matching Figma */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-7 w-3 rounded-xs bg-primary inline-block" />
              <span className="text-xs sm:text-sm font-semibold text-primary tracking-wide">
                This Month
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              All Products
            </h1>
          </div>

          {/* Search Box on right matching Figma */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-border/80 bg-background pl-4 pr-10 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary shadow-2xs"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Mobile filter toggle */}
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden shrink-0"
              onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
              aria-label="Toggle filters"
            >
              <SlidersHorizontal className="size-4" />
            </Button>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Filter Sidebar - Desktop */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-20">
            <ProductFilters
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              selectedPriceTier={selectedPriceTier}
              onSelectPriceTier={handleSelectPriceTier}
              budgetInput={budgetInput}
              onBudgetChange={handleBudgetChange}
              onReset={handleResetFilters}
            />
          </aside>

          {/* Left Column: Filter Sidebar - Mobile Collapsible */}
          {isMobileFiltersOpen && (
            <div className="lg:hidden col-span-1">
              <ProductFilters
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                  handleSelectCategory(cat);
                  setIsMobileFiltersOpen(false);
                }}
                selectedPriceTier={selectedPriceTier}
                onSelectPriceTier={(label, min, max) => {
                  handleSelectPriceTier(label, min, max);
                  setIsMobileFiltersOpen(false);
                }}
                budgetInput={budgetInput}
                onBudgetChange={handleBudgetChange}
                onReset={() => {
                  handleResetFilters();
                  setIsMobileFiltersOpen(false);
                }}
              />
            </div>
          )}

          {/* Right Column: 3-column Product Grid */}
          <main className="col-span-1 lg:col-span-9 space-y-8">
            <ProductGrid
              products={products}
              isLoading={isLoading}
              skeletonCount={15}
              columns={3}
            />

            {/* Bottom Pagination Bar matching Figma */}
            {!isLoading && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/60">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* PREV button */}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="h-8 px-2.5 text-xs font-semibold"
                  >
                    <ChevronLeft className="size-3.5 mr-1" />
                    PREV
                  </Button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNum = index + 1;
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          "size-8 rounded-xs text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "bg-muted/40 text-foreground hover:bg-muted",
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* NEXT button */}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className="h-8 px-2.5 text-xs font-semibold"
                  >
                    NEXT
                    <ChevronRight className="size-3.5 ml-1" />
                  </Button>
                </div>

                {/* Showing Summary text matching Figma */}
                <span className="text-xs text-muted-foreground font-medium">
                  Showing {(currentPage - 1) * 15 + 1} to{" "}
                  {Math.min(currentPage * 15, totalCount)} of {totalCount} (
                  {totalPages} {totalPages === 1 ? "Page" : "Pages"})
                </span>
              </div>
            )}
          </main>
        </div>
      </Container>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-12 text-center text-muted-foreground text-sm">
          Loading catalog...
        </div>
      }
    >
      <ProductsContent />
    </React.Suspense>
  );
}
