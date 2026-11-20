import AddCategoryDialog from "@/components/categories/AddCategoryDialog";
import CategoryCard from "@/components/categories/CategoryCard";
import CategorySkeletonGrid from "@/components/categories/CategorySkeletonGrid";
import DeleteCategoryDialog from "@/components/categories/DeleteCategoryDialog";
import EditCategoryDialog from "@/components/categories/EditCategoryDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CategoryActionResult } from "@/routes/actions/category.action";
import type { CategoryLoaderData } from "@/routes/loaders/category.loader";
import type { ICategory } from "@/types/category";
import { Plus, Tags } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useFetcher, useLoaderData, useNavigation } from "react-router";
import { toast } from "sonner";

export const CategoriesPage: React.FC = () => {
  const loaderData = useLoaderData() as CategoryLoaderData | undefined;
  const navigation = useNavigation();
  const statusFetcher = useFetcher<CategoryActionResult>();

  const categories = loaderData?.categories ?? [];
  const isLoading =
    navigation.state === "loading" || statusFetcher.state === "submitting";

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(
    null,
  );
  const [deletingCategory, setDeletingCategory] = useState<ICategory | null>(
    null,
  );

  useEffect(() => {
    if (statusFetcher.data && statusFetcher.data.intent === "updateStatus") {
      if (statusFetcher.data.success) {
        toast.success(
          statusFetcher.data.message || "Category status updated successfully!",
        );
      } else if (statusFetcher.data.error) {
        toast.error(statusFetcher.data.error);
      }
    }
  }, [statusFetcher.data]);

  const handleToggleStatus = (cat: ICategory) => {
    const nextStatus = !cat.isActive;
    const formData = new FormData();
    formData.append("intent", "updateStatus");
    formData.append("categoryId", cat._id);
    formData.append("isActive", String(nextStatus));

    statusFetcher.submit(formData, {
      method: "post",
      action: "/categories",
    });
  };

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

      {/* Loading Skeletons via dedicated CategorySkeletonGrid component */}
      {isLoading && categories.length === 0 && (
        <CategorySkeletonGrid count={8} />
      )}

      {/* Empty State */}
      {categories.length === 0 && !isLoading && (
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
      {categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category._id}
              category={category}
              onEdit={(cat) => setEditingCategory(cat)}
              onDelete={(cat) => setDeletingCategory(cat)}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <AddCategoryDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
      />

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
