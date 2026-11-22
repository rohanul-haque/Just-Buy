import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  AlertCircle,
  Loader2,
  Package,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/api/client";
import categoryService from "@/api/services/category.service";
import productService from "@/api/services/product.service";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { ICategory } from "@/types/category";
import type { IProduct } from "@/types/product";

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Delete Dialog State
  const [productToDelete, setProductToDelete] = useState<IProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Fetch Categories for Filter Dropdown
  const fetchCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const response = await categoryService.getAllCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch {
      // Non-blocking error for category filter
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  // 2. Fetch Products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        page,
        limit: 12,
      };

      if (selectedCategory !== "ALL") {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await productService.getMyProducts(params);
      if (response.success && response.data) {
        setProducts(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
          setTotalProducts(response.pagination.total || response.data.length);
        } else {
          setTotalPages(1);
          setTotalProducts(response.data.length);
        }
      } else {
        setProducts([]);
        setTotalProducts(0);
        setTotalPages(1);
      }
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedCategory, searchQuery]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      const response = await productService.deleteMyProduct(
        productToDelete._id,
      );
      if (response.success) {
        toast.success("Product deleted successfully");
        setProductToDelete(null);
        await fetchProducts();
      } else {
        toast.error(response.message || "Failed to delete product.");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Toolbar & Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">
            Products
          </h2>
          <p className="text-sm text-[#64748B] mt-1">
            Manage your store catalog, pricing, and live inventory (
            {totalProducts} total).
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchProducts()}
            disabled={isLoading}
            className="h-10 border-[#E5E7EB] text-[#374151] hover:bg-[#F8FAFC] cursor-pointer"
            title="Refresh Products"
          >
            <RotateCcw
              className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          {/* Add Product Button */}
          <Button
            onClick={() => navigate("/products/new")}
            className="h-10 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold px-4 rounded-md shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* 2. Filter & Search Bar */}
      <Card className="p-4 border-[#E5E7EB] bg-white rounded-md shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search products by name or brand..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-10 rounded-md border-[#E5E7EB] text-sm text-[#0F172A] w-full"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Category Filter Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              disabled={isLoadingCategories}
              className="h-10 px-3 rounded-md border border-[#E5E7EB] bg-white text-xs font-medium text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#6366F1] min-w-[160px]"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Clear Filters Button */}
            {(selectedCategory !== "ALL" || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSearchQuery("");
                  setPage(1);
                }}
                className="text-xs text-[#EF4444] hover:bg-[#FEF2F2] h-10 px-2 cursor-pointer"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 3. Products Grid Layout */}
      {/* Exactly 3 columns on Desktop, 2 on Tablet, 1 on Mobile */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card
              key={index}
              className="border border-[#E5E7EB] bg-white rounded-lg p-4 space-y-4 shadow-xs"
            >
              <div className="flex items-start gap-3.5">
                <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
              <Skeleton className="h-8 w-full" />
              <div className="pt-2 border-t border-[#F1F5F9] space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-[#E5E7EB] bg-white p-12 text-center flex flex-col items-center justify-center space-y-3">
          <AlertCircle className="w-10 h-10 text-[#EF4444]" />
          <p className="text-base font-semibold text-[#0F172A]">
            Unable to load products
          </p>
          <p className="text-xs text-[#64748B] max-w-md">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchProducts()}
            className="mt-2 text-xs"
          >
            Retry
          </Button>
        </Card>
      ) : products.length === 0 ? (
        <Card className="border-[#E5E7EB] bg-white p-16 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center">
            <Package className="w-8 h-8 text-[#94A3B8]" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-base font-bold text-[#0F172A]">
              {selectedCategory !== "ALL" || searchQuery
                ? "No products match your filter"
                : "No products in your catalog"}
            </h3>
            <p className="text-xs text-[#64748B]">
              {selectedCategory !== "ALL" || searchQuery
                ? "Try clearing the search query or selecting 'All Categories' to view all your products."
                : "You haven't added any products yet. Click 'Add Product' above to start listing items in your store."}
            </p>
          </div>
          {selectedCategory !== "ALL" || searchQuery ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory("ALL");
                setSearchQuery("");
                setPage(1);
              }}
              className="text-xs"
            >
              Show All Products
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/products/new")}
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold px-4"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add First Product
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onDelete={(prod) => setProductToDelete(prod)}
            />
          ))}
        </div>
      )}

      {/* 4. Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border border-[#E5E7EB] bg-white rounded-md shadow-xs">
          <p className="text-xs text-[#64748B]">
            Page {page} of {totalPages} ({totalProducts} products)
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-8 text-xs rounded-md"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-8 text-xs rounded-md"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* 5. Delete Confirmation Dialog */}
      <Dialog
        open={!!productToDelete}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setProductToDelete(null);
          }
        }}
      >
        <DialogContent className="max-w-md bg-white p-6 rounded-lg">
          <DialogHeader className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center text-[#DC2626] mb-1">
              <Trash2 className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-[#0F172A]">
              Delete Product
            </DialogTitle>
            <DialogDescription className="text-xs text-[#64748B] leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-[#0F172A]">
                &quot;{productToDelete?.name}&quot;
              </span>
              ? This action cannot be undone and will remove this product and its photos from your store.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex items-center justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setProductToDelete(null)}
              className="border-[#E5E7EB] text-[#374151]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold cursor-pointer shadow-xs"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;
