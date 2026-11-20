import { getApiErrorMessage } from "@/api/client";
import { categoriesQueryOptions } from "@/api/queries/category.queries";
import AddCategoryDialog from "@/components/categories/AddCategoryDialog";
import CategoryCard from "@/components/categories/CategoryCard";
import DeleteCategoryDialog from "@/components/categories/DeleteCategoryDialog";
import EditCategoryDialog from "@/components/categories/EditCategoryDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ICategory } from "@/types/category";
import { useQuery } from "@tanstack/react-query";
import { Plus, Tags } from "lucide-react";
import React, { useState } from "react";
import { useLoaderData } from "react-router";

export const CategoriesPage: React.FC = () => {
  const initialData = useLoaderData() as ICategory[] | undefined;
  const {
    data: categories = initialData ?? [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    ...categoriesQueryOptions(),
    initialData,
  });

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(
    null,
  );
  const [deletingCategory, setDeletingCategory] = useState<ICategory | null>(
    null,
  );

  const errorMessage = isError ? getApiErrorMessage(error) : null;

  return (
    <div className="space-y-6">
      {/* Top Header: Page Heading + Add Category Button */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
            Categories
          </h1>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          className="h-10 px-5 rounded-md bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium text-sm transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add Category</span>
        </Button>
      </div>

      {/* Error state */}
      {errorMessage && !isLoading && (
        <div className="p-4 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] flex items-center justify-between">
          <p className="text-sm font-medium">{errorMessage}</p>
          <Button
            variant="link"
            onClick={() => refetch()}
            className="text-xs font-semibold text-[#EF4444] p-0 h-auto underline"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Loading Skeletons (4 cards per row on desktop with shadcn Skeleton) */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <Card
              key={idx}
              className="bg-white rounded-md p-5 border-[#E5E7EB] space-y-4"
            >
              <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-md mx-auto" />
              <Skeleton className="h-4 rounded-md w-3/4 mx-auto" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-9 rounded-md flex-1" />
                <Skeleton className="h-9 rounded-md flex-1" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !errorMessage && categories.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-md border-[#E5E7EB] p-8">
          <Tags className="w-12 h-12 text-[#4F46E5] mb-3" />
          <h3 className="text-base font-semibold text-[#0F172A] mb-1">
            No categories yet
          </h3>
          <p className="text-sm text-[#4B5563] max-w-sm mb-4">
            Get started by adding your first product category for vendors and
            buyers.
          </p>
          <Button
            onClick={() => setIsAddOpen(true)}
            className="h-10 px-5 rounded-md bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add First Category</span>
          </Button>
        </Card>
      )}

      {/* Category Card Grid (Exactly 4 cards in each row on desktop) */}
      {!isLoading && !errorMessage && categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category._id}
              category={category}
              onEdit={(cat) => setEditingCategory(cat)}
              onDelete={(cat) => setDeletingCategory(cat)}
            />
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <AddCategoryDialog open={isAddOpen} onOpenChange={setIsAddOpen} />

      {/* Edit Dialog */}
      <EditCategoryDialog
        open={!!editingCategory}
        category={editingCategory}
        onOpenChange={(open) => {
          if (!open) setEditingCategory(null);
        }}
      />

      {/* Delete Dialog */}
      <DeleteCategoryDialog
        open={!!deletingCategory}
        category={deletingCategory}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null);
        }}
      />
    </div>
  );
};

export default CategoriesPage;
