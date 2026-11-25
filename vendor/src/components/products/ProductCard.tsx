import React, { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowUp, Check, Loader2, MoreVertical, Package, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { IProduct } from "@/types/product";

interface ProductCardProps {
  product: IProduct;
  onEdit?: (product: IProduct) => void;
  onDelete?: (product: IProduct) => void;
  onStatusChange?: (product: IProduct, isActive: boolean) => Promise<void>;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const navigate = useNavigate();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const imageUrl = product.featureImage?.url || product.images?.[0]?.url;
  const categoryName =
    typeof product.category === "object" && product.category?.name
      ? product.category.name
      : "Battery";

  const formatCurrency = (amount: number | undefined | null) => {
    const validAmount = Number(amount) || 0;
    return `$${validAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Safe numerical sales and stock calculations
  const salesCount = Math.max(0, Number(product.salesCount) || 0);
  const stock = Math.max(0, Number(product.stock) || 0);
  const totalInventory = salesCount + stock;

  const soldPercent =
    totalInventory > 0 ? Math.round((salesCount / totalInventory) * 100) : 60;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(product);
    } else {
      navigate(`/products/edit/${product._id}`);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(product);
    }
  };

  const handleStatusSelect = async (newStatus: boolean) => {
    if (newStatus === product.isActive || isUpdatingStatus) return;
    if (onStatusChange) {
      setIsUpdatingStatus(true);
      try {
        await onStatusChange(product, newStatus);
      } finally {
        setIsUpdatingStatus(false);
      }
    }
  };

  return (
    <Card className="border border-[#ffceb0]/60 bg-[#FFE7D9] rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden h-full text-[#1F2937]">
      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Top: Product Image (Left) + Basic Info (Title, Category, Price) & Dropdown Menu */}
        <div>
          <div className="flex items-start gap-4">
            {/* Product Image in rounded white square box matching mockup */}
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-white p-2 shrink-0 flex items-center justify-center border border-white shadow-xs overflow-hidden relative">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <Package className="w-8 h-8 text-[#94A3B8]" />
              )}
            </div>

            {/* Basic Information matching mockup: Title, Category subtitle, Price */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0">
                  <h3
                    className="text-base sm:text-lg font-bold text-[#1F2937] truncate leading-tight"
                    title={product.name}
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-normal text-[#6B7280] truncate mt-0.5">
                    {categoryName}
                  </p>
                  <p className="text-base sm:text-lg font-extrabold text-[#1F2937] mt-1.5">
                    {formatCurrency(product.price)}
                  </p>
                </div>

                {/* Dropdown Menu for Status & Actions */}
                <div className="flex items-center gap-1 shrink-0 -mt-1">
                  <Badge
                    className={`text-[9px] font-bold px-1.5 py-0.5 ${
                      product.isActive
                        ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                        : "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
                    }`}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isUpdatingStatus}
                        className="h-6 w-6 p-0 text-[#64748B] hover:text-[#0F172A] hover:bg-[#ffceb0]/40 rounded-full cursor-pointer"
                        title="Actions & status"
                      >
                        {isUpdatingStatus ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <MoreVertical className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-[#FFE7D9] border border-[#ffceb0]/80">
                      <DropdownMenuLabel className="text-xs text-[#64748B]">
                        Product Actions
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={handleEditClick}
                        className="text-xs cursor-pointer font-medium hover:bg-[#ffceb0]/60 flex items-center gap-2"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#fe6201]" />
                        <span>Edit Product</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDeleteClick}
                        className="text-xs cursor-pointer font-medium text-[#DC2626] hover:bg-[#ffceb0]/60 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                        <span>Delete Product</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[#ffceb0]/60" />
                      <DropdownMenuLabel className="text-xs text-[#64748B]">
                        Status
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleStatusSelect(true)}
                        className={`text-xs cursor-pointer font-medium hover:bg-[#ffceb0]/60 flex items-center justify-between ${
                          product.isActive ? "text-[#059669] font-bold" : ""
                        }`}
                      >
                        <span>Active</span>
                        {product.isActive && (
                          <Check className="w-3.5 h-3.5 text-[#059669]" />
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusSelect(false)}
                        className={`text-xs cursor-pointer font-medium hover:bg-[#ffceb0]/60 flex items-center justify-between ${
                          !product.isActive ? "text-[#DC2626] font-bold" : ""
                        }`}
                      >
                        <span>Inactive</span>
                        {!product.isActive && (
                          <Check className="w-3.5 h-3.5 text-[#DC2626]" />
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>

          {/* Middle: Summary section exactly matching mockup */}
          <div className="mt-3 space-y-1">
            <h4 className="text-sm font-bold text-[#1F2937]">Summary</h4>
            <p
              className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed"
              title={product.description}
            >
              {product.description ||
                "Lorem ipsum is placeholder text commonly used in the graphic."}
            </p>
          </div>
        </div>

        {/* Bottom: Inner rounded box with Sales & Remaining Products metrics matching mockup */}
        <div className="rounded-xl border border-[#ffceb0]/80 bg-[#ffefe6]/80 p-3.5 space-y-2.5">
          {/* Sales row */}
          <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-[#1F2937]">
            <span className="text-[#374151]">Sales</span>
            <div className="flex items-center gap-1 font-semibold text-[#1F2937]">
              <ArrowUp className="w-3.5 h-3.5 text-[#fe6201] stroke-[2.5]" />
              <span>{salesCount}</span>
            </div>
          </div>

          <div className="h-px bg-[#ffceb0]/60 w-full" />

          {/* Remaining Products row with pill progress bar */}
          <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-[#1F2937]">
            <span className="text-[#374151]">Remaining Products</span>
            <div className="flex items-center gap-2.5 font-semibold text-[#1F2937]">
              {/* Pill Progress Bar matching mockup: orange filled on left, white on right */}
              <div className="w-16 h-2 bg-white rounded-full overflow-hidden flex shadow-2xs">
                <div
                  className="bg-[#fe6201] h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(15, soldPercent))}%` }}
                />
              </div>
              <span>{stock}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
