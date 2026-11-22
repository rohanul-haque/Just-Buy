import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Check, Loader2, MoreVertical, Package, Pencil, Trash2 } from "lucide-react";
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
      : "Uncategorized";

  const formatCurrency = (amount: number | undefined | null) => {
    const validAmount = Number(amount) || 0;
    return `৳${validAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Safe numerical sales and stock calculations
  const salesCount = Math.max(0, Number(product.salesCount) || 0);
  const stock = Math.max(0, Number(product.stock) || 0);
  const totalInventory = salesCount + stock;

  const soldPercent =
    totalInventory > 0 ? Math.round((salesCount / totalInventory) * 100) : 0;
  const stockPercent = totalInventory > 0 ? 100 - soldPercent : 0;

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
    <Card className="border border-[#E5E7EB] bg-white rounded-lg shadow-xs hover:shadow-xs transition-shadow duration-200 flex flex-col justify-between overflow-hidden h-full">
      <CardContent className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        {/* Top: Product Image (Left) + Basic Info (Right) */}
        <div>
          <div className="flex items-start gap-3">
            {/* Product Image */}
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-md border border-[#E5E7EB] bg-[#F8FAFC] overflow-hidden shrink-0 flex items-center justify-center relative">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if broken image
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <Package className="w-7 h-7 text-[#94A3B8]" />
              )}
            </div>

            {/* Basic Information */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-[#6366F1] bg-[#EEF2FF] px-1.5 py-0.5 rounded-sm truncate max-w-[110px]">
                  {categoryName}
                </span>

                {/* Status Badge with Dropdown Control */}
                <div className="flex items-center gap-1 shrink-0">
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
                        className="h-5 w-5 p-0 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer"
                        title="Change status"
                      >
                        {isUpdatingStatus ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <MoreVertical className="w-3 h-3" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36 bg-white">
                      <DropdownMenuLabel className="text-xs text-[#64748B]">
                        Product Status
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleStatusSelect(true)}
                        className={`text-xs cursor-pointer font-medium hover:bg-[#F8FAFC] flex items-center justify-between ${
                          product.isActive
                            ? "text-[#059669] font-bold bg-[#ECFDF5]"
                            : ""
                        }`}
                      >
                        <span>Active</span>
                        {product.isActive && (
                          <Check className="w-3.5 h-3.5 text-[#059669]" />
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusSelect(false)}
                        className={`text-xs cursor-pointer font-medium hover:bg-[#F8FAFC] flex items-center justify-between ${
                          !product.isActive
                            ? "text-[#DC2626] font-bold bg-[#FEF2F2]"
                            : ""
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

              <h3
                className="text-sm font-bold text-[#0F172A] truncate"
                title={product.name}
              >
                {product.name}
              </h3>
              {product.brand && (
                <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                  Brand: {product.brand}
                </p>
              )}
              <p className="text-sm font-extrabold text-[#0F172A] mt-1">
                {formatCurrency(product.price)}
              </p>
            </div>
          </div>

          {/* Product Description */}
          <div className="mt-2">
            <p
              className="text-xs text-[#64748B] line-clamp-2 leading-relaxed"
              title={product.description}
            >
              {product.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Bottom: Sales & Remaining Stock + Progress Bar + Edit Button */}
        <div className="pt-2.5 border-t border-[#F1F5F9] space-y-2.5">
          {/* Numerical Metrics */}
          <div className="flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
              <span className="text-[#64748B]">Sold:</span>
              <span className="font-bold text-[#0F172A]">{salesCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span className="text-[#64748B]">Remaining Stock:</span>
              <span className="font-bold text-[#0F172A]">{stock}</span>
            </div>
          </div>

          {/* Horizontal Progress Bar */}
          <div
            className="h-1.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden flex"
            title={`Sold: ${salesCount} (${soldPercent}%), Remaining: ${stock} (${stockPercent}%)`}
          >
            {totalInventory > 0 ? (
              <>
                <div
                  className="bg-[#6366F1] h-full transition-all duration-300"
                  style={{ width: `${soldPercent}%` }}
                />
                <div
                  className="bg-[#10B981] h-full transition-all duration-300"
                  style={{ width: `${stockPercent}%` }}
                />
              </>
            ) : (
              <div
                className="bg-[#E2E8F0] h-full w-full"
                title="No inventory/sales data"
              />
            )}
          </div>

          {/* Action Buttons: Edit & Delete Side by Side */}
          <div className="flex items-center gap-2 pt-0.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              className="flex-1 h-7 text-xs font-semibold border-[#E5E7EB] text-[#374151] hover:text-[#6366F1] hover:bg-[#F8FAFC] flex items-center justify-center gap-1.5 cursor-pointer rounded-md transition-colors"
            >
              <Pencil className="w-3 h-3 text-[#6366F1]" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteClick}
              className="flex-1 h-7 text-xs font-semibold border-[#FECACA] text-[#DC2626] hover:bg-[#FEF2F2] hover:text-[#B91C1C] flex items-center justify-center gap-1.5 cursor-pointer rounded-md transition-colors"
            >
              <Trash2 className="w-3 h-3 text-[#DC2626]" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
