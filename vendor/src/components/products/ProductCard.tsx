import React from "react";
import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { IProduct } from "@/types/product";

interface ProductCardProps {
  product: IProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
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

  return (
    <Card className="border border-[#E5E7EB] bg-white rounded-lg shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between overflow-hidden h-full">
      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Top: Product Image (Left) + Basic Info (Right) */}
        <div>
          <div className="flex items-start gap-3.5">
            {/* Product Image */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-md border border-[#E5E7EB] bg-[#F8FAFC] overflow-hidden shrink-0 flex items-center justify-center relative">
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
                <Package className="w-8 h-8 text-[#94A3B8]" />
              )}

              {!product.isActive && (
                <span className="absolute top-1 left-1 bg-[#EF4444] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                  Inactive
                </span>
              )}
            </div>

            {/* Basic Information */}
            <div className="flex-1 min-w-0">
              <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-[#6366F1] bg-[#EEF2FF] px-2 py-0.5 rounded-sm mb-1 truncate max-w-full">
                {categoryName}
              </span>
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
              <p className="text-base font-extrabold text-[#0F172A] mt-1.5">
                {formatCurrency(product.price)}
              </p>
            </div>
          </div>

          {/* Product Description */}
          <div className="mt-3">
            <p
              className="text-xs text-[#64748B] line-clamp-2 leading-relaxed"
              title={product.description}
            >
              {product.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Bottom: Sales & Remaining Stock + Horizontal Progress Bar */}
        <div className="pt-3 border-t border-[#F1F5F9] space-y-2">
          {/* Numerical Metrics */}
          <div className="flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6366F1]" />
              <span className="text-[#64748B]">Sold:</span>
              <span className="font-bold text-[#0F172A]">{salesCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="text-[#64748B]">Remaining Stock:</span>
              <span className="font-bold text-[#0F172A]">{stock}</span>
            </div>
          </div>

          {/* Horizontal Progress Bar */}
          <div
            className="h-2 w-full bg-[#F1F5F9] rounded-full overflow-hidden flex"
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
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
