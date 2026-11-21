"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { Skeleton } from "@/components/ui/skeleton";

const PRICE_TIERS = [
  { label: "Value Under $20", min: 0, max: 20 },
  { label: "Mid-range $20-$60", min: 20, max: 60 },
  { label: "High-end $60 & Above", min: 60, max: undefined },
];

interface ProductFiltersProps {
  selectedCategory?: string;
  onSelectCategory: (categoryId?: string) => void;
  selectedPriceTier?: string;
  onSelectPriceTier: (tierLabel?: string, min?: number, max?: number) => void;
  budgetInput?: string;
  onBudgetChange: (budget: string) => void;
  onReset: () => void;
}

export function ProductFilters({
  selectedCategory,
  onSelectCategory,
  selectedPriceTier,
  onSelectPriceTier,
  budgetInput,
  onBudgetChange,
  onReset,
}: ProductFiltersProps) {
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const [isCategoryOpen, setIsCategoryOpen] = React.useState(true);
  const [isPriceOpen, setIsPriceOpen] = React.useState(true);

  const hasActiveFilters = Boolean(
    selectedCategory || selectedPriceTier || budgetInput,
  );

  return (
    <div className="flex flex-col gap-5 rounded-lg border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
      {/* Orange Filters Header matching Figma */}
      <div className="flex items-center justify-between rounded-md bg-primary px-4 py-2.5 text-primary-foreground">
        <span className="font-bold text-sm sm:text-base">Filters</span>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-medium text-white/90 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="size-3" />
            <span>Reset</span>
          </button>
        ) : null}
      </div>

      {/* Category Filter Accordion */}
      <div className="border-b border-border/60 pb-4">
        <button
          type="button"
          onClick={() => setIsCategoryOpen((prev) => !prev)}
          className="flex w-full items-center justify-between py-1 text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
        >
          <span>Category</span>
          {isCategoryOpen ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </button>

        {isCategoryOpen && (
          <div className="mt-3 space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {isCategoriesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full rounded-xs" />
                ))}
              </div>
            ) : categories && categories.length > 0 ? (
              categories.map((cat) => {
                const isChecked = selectedCategory === cat._id;
                return (
                  <label
                    key={cat._id}
                    className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground/80 hover:text-foreground cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        onSelectCategory(isChecked ? undefined : cat._id)
                      }
                      className="size-4 rounded-xs border-border text-primary accent-primary focus:ring-primary"
                    />
                    <span className="capitalize">{cat.name}</span>
                  </label>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground">No categories</p>
            )}
          </div>
        )}
      </div>

      {/* Price Filter Accordion */}
      <div>
        <button
          type="button"
          onClick={() => setIsPriceOpen((prev) => !prev)}
          className="flex w-full items-center justify-between py-1 text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
        >
          <span>Price</span>
          {isPriceOpen ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </button>

        {isPriceOpen && (
          <div className="mt-3 space-y-3">
            <div className="space-y-2.5">
              {PRICE_TIERS.map((tier) => {
                const isChecked = selectedPriceTier === tier.label;
                return (
                  <label
                    key={tier.label}
                    className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground/80 hover:text-foreground cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        onSelectPriceTier(
                          isChecked ? undefined : tier.label,
                          isChecked ? undefined : tier.min,
                          isChecked ? undefined : tier.max,
                        )
                      }
                      className="size-4 rounded-xs border-border text-primary accent-primary focus:ring-primary"
                    />
                    <span>{tier.label}</span>
                  </label>
                );
              })}
            </div>

            {/* Custom Budget Input matching Figma */}
            <div className="pt-2">
              <label className="text-xs text-muted-foreground font-medium block mb-1">
                Enter budget $
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="e.g. 50"
                  min="0"
                  value={budgetInput}
                  onChange={(e) => onBudgetChange(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
