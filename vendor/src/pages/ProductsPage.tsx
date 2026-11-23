import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  AlertCircle,
  Loader2,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/api/client";
import categoryService from "@/api/services/category.service";
import productService from "@/api/services/product.service";
import ProductCard from "@/components/products/ProductCard";
import ProductStatisticsCards from "@/components/products/ProductStatisticsCards";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { ICategory } from "@/types/category";
import type { IProduct, IProductStatistics } from "@/types/product";

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Statistics State
  const [statistics, setStatistics] = useState<IProductStatistics | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Filters & Pagination
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Request ID reference to prevent race conditions
  const latestRequestIdRef = useRef<number>(0);

  // Delete Dialog State
  const [productToDelete, setProductToDelete] = useState<IProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search query (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  // 2. Fetch Product Statistics
  const fetchStatistics = useCallback(async () => {
    setIsStatsLoading(true);
    setStatsError(null);
    try {
      const response = await productService.getVendorProductStatistics();
      if (response.success && response.data) {
        setStatistics(response.data);
      }
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setStatsError(msg);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  // 3. Fetch Products (Server-Side)
  const fetchProducts = useCallback(async () => {
    const requestId = ++latestRequestIdRef.current;
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
      if (selectedStatus !== "ALL") {
        params.isActive = selectedStatus === "ACTIVE";
      }
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const response = await productService.getMyProducts(params);

      // Guard against stale response
      if (requestId !== latestRequestIdRef.current) return;

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
      if (requestId !== latestRequestIdRef.current) return;
      const msg = getApiErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [page, selectedCategory, selectedStatus, debouncedSearch]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle Product Status Change (Active / Inactive)
  const handleStatusChange = async (product: IProduct, newStatus: boolean) => {
    try {
      const response = await productService.updateProductStatus(
        product._id,
        newStatus,
      );
      if (response.success) {
        toast.success(
          `Product marked as ${newStatus ? "Active" : "Inactive"} successfully`,
        );
        // Synchronize products and statistics
        await Promise.all([fetchProducts(), fetchStatistics()]);
      } else {
        toast.error(response.message || "Failed to update product status.");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

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
        await Promise.all([fetchProducts(), fetchStatistics()]);
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
      {/* 1. Product Statistics Cards */}
      <ProductStatisticsCards
        statistics={statistics}
        isLoading={isStatsLoading}
        error={statsError}
      />

      {/* 2. Combined Toolbar: Search, Filters, and Add Product Button */}
      <Card className="px-4 py-3 border-[#E5E7EB] bg-white rounded-lg shadow-xs">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3.5">
          {/* Search and Filter Controls */}
          <div className="flex flex-1 flex-col sm:flex-row items-center gap-2 w-full">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search products by name or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8.5 h-8.5 rounded-md border-[#E5E7EB] text-xs text-[#0F172A] w-full"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Category Filter Dropdown (shadcn Select) */}
              <Select
                value={selectedCategory}
                onValueChange={(val) => {
                  setSelectedCategory(val);
                  setPage(1);
                }}
                disabled={isLoadingCategories}
              >
                <SelectTrigger className="h-8.5 w-[140px] text-xs font-medium text-[#374151] border-[#E5E7EB] bg-white">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="ALL" className="text-xs">
                    All Categories
                  </SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id} className="text-xs">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter Dropdown (shadcn Select) */}
              <Select
                value={selectedStatus}
                onValueChange={(val) => {
                  setSelectedStatus(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8.5 w-[120px] text-xs font-medium text-[#374151] border-[#E5E7EB] bg-white">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="ALL" className="text-xs">
                    All Status
                  </SelectItem>
                  <SelectItem value="ACTIVE" className="text-xs">
                    Active
                  </SelectItem>
                  <SelectItem value="INACTIVE" className="text-xs">
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters Button */}
              {(selectedCategory !== "ALL" ||
                selectedStatus !== "ALL" ||
                searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory("ALL");
                    setSelectedStatus("ALL");
                    setSearchQuery("");
                    setPage(1);
                  }}
                  className="text-xs text-[#EF4444] hover:bg-[#FEF2F2] h-8.5 px-2 cursor-pointer"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Right: Add Product Button */}
          <div className="shrink-0 self-end lg:self-center w-full sm:w-auto flex justify-end">
            <Button
              onClick={() => navigate("/products/new")}
              className="h-8.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold px-3.5 rounded-md shadow-xs flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Product
            </Button>
          </div>
        </div>
      </Card>

      {/* 4. Products Grid Layout */}
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
              {selectedCategory !== "ALL" ||
              selectedStatus !== "ALL" ||
              searchQuery
                ? "No products match your filter"
                : "No products in your catalog"}
            </h3>
            <p className="text-xs text-[#64748B]">
              {selectedCategory !== "ALL" ||
              selectedStatus !== "ALL" ||
              searchQuery
                ? "Try clearing the search query or adjusting your filters to view more products."
                : "You haven't added any products yet. Click 'Add Product' above to start listing items in your store."}
            </p>
          </div>
          {selectedCategory !== "ALL" ||
          selectedStatus !== "ALL" ||
          searchQuery ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory("ALL");
                setSelectedStatus("ALL");
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
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* 5. Server-Side Pagination with shadcn/ui Pagination Component */}
      {!isLoading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border border-[#E5E7EB] bg-white rounded-md shadow-xs">
          <p className="text-xs text-[#64748B] text-center sm:text-left">
            Showing page <span className="font-semibold text-[#0F172A]">{page}</span> of{" "}
            <span className="font-semibold text-[#0F172A]">{totalPages}</span>{" "}
            ({totalProducts} total {totalProducts === 1 ? "product" : "products"})
          </p>

          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className={
                    page <= 1
                      ? "pointer-events-none opacity-50 cursor-not-allowed text-xs"
                      : "cursor-pointer text-xs"
                  }
                />
              </PaginationItem>

              {/* Page numbers logic */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  return (
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - page) <= 1
                  );
                })
                .reduce<(number | string)[]>((acc, curr, index, arr) => {
                  if (index > 0 && (curr as number) - (arr[index - 1] as number) > 1) {
                    acc.push(`ellipsis-${curr}`);
                  }
                  acc.push(curr);
                  return acc;
                }, [])
                .map((item) => {
                  if (typeof item === "string") {
                    return (
                      <PaginationItem key={item}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return (
                    <PaginationItem key={item}>
                      <PaginationLink
                        isActive={page === item}
                        onClick={() => setPage(item)}
                        className="h-8 w-8 text-xs cursor-pointer"
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className={
                    page >= totalPages
                      ? "pointer-events-none opacity-50 cursor-not-allowed text-xs"
                      : "cursor-pointer text-xs"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* 6. Delete Confirmation Dialog */}
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
