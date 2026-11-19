import React, { useCallback, useEffect, useState } from "react";
import { Plus, Search, RefreshCw, Tags } from "lucide-react";
import categoryService from "@/api/services/category.service";
import CategoryCard from "@/components/categories/CategoryCard";
import AddCategoryDialog from "@/components/categories/AddCategoryDialog";
import EditCategoryDialog from "@/components/categories/EditCategoryDialog";
import DeleteCategoryDialog from "@/components/categories/DeleteCategoryDialog";
import type { ICategory } from "@/types/category";
import { getApiErrorMessage } from "@/api/client";

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<ICategory | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await categoryService.getAllCategories();
      setCategories(res.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase().trim()),
  );

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white border border-[#E5E7EB] text-sm text-[#0F172A] placeholder:text-[#4B5563] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition"
          />
        </div>

        {/* Right Actions: Refresh + Add Category Button */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            type="button"
            onClick={fetchCategories}
            title="Refresh"
            disabled={isLoading}
            className="p-2.5 rounded-full bg-white border border-[#E5E7EB] text-[#1F2937] hover:text-[#4F46E5] hover:bg-[#F8FAFC] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="h-10 flex items-center gap-2 px-5 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium text-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && !isLoading && (
        <div className="p-4 rounded-[16px] bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] flex items-center justify-between">
          <p className="text-sm font-medium">{error}</p>
          <button
            type="button"
            onClick={fetchCategories}
            className="text-xs font-semibold underline hover:no-underline cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-[28px]">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-[16px] p-5 md:p-[28px] border border-[#E5E7EB] animate-pulse space-y-4"
            >
              <div className="w-full aspect-square bg-[#F1F5F9] rounded-[16px]" />
              <div className="h-4 bg-[#F1F5F9] rounded-full w-3/4 mx-auto" />
              <div className="flex gap-2 pt-1">
                <div className="h-9 bg-[#F1F5F9] rounded-full flex-1" />
                <div className="h-9 bg-[#F1F5F9] rounded-full flex-1" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredCategories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-[16px] border border-[#E5E7EB] p-8">
          <Tags className="w-12 h-12 text-[#4F46E5] mb-3" />
          <h3 className="text-base font-semibold text-[#0F172A] mb-1">
            {searchQuery ? "No matching categories" : "No categories yet"}
          </h3>
          <p className="text-sm text-[#4B5563] max-w-sm mb-4">
            {searchQuery
              ? `No categories match "${searchQuery}". Try a different keyword.`
              : "Get started by adding your first product category for vendors and buyers."}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="h-10 flex items-center gap-2 px-5 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-medium transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Category</span>
            </button>
          )}
        </div>
      )}

      {/* Categories Grid (Exactly 3 cards per row on desktop) */}
      {!isLoading && !error && filteredCategories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-[28px]">
          {filteredCategories.map((category) => (
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
      <AddCategoryDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={fetchCategories}
      />

      {/* Edit Dialog */}
      <EditCategoryDialog
        open={!!editingCategory}
        category={editingCategory}
        onOpenChange={(open) => {
          if (!open) setEditingCategory(null);
        }}
        onSuccess={fetchCategories}
      />

      {/* Delete Dialog */}
      <DeleteCategoryDialog
        open={!!deletingCategory}
        category={deletingCategory}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null);
        }}
        onSuccess={fetchCategories}
      />
    </div>
  );
};

export default CategoriesPage;
