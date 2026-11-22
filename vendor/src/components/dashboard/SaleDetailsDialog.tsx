import React from "react";
import {
  CreditCard,
  Package,
  Receipt,
  User,
} from "lucide-react";
import ProfileAvatar from "@/components/ui/ProfileAvatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { IVendorRecentSale } from "@/types/dashboard";

interface SaleDetailsDialogProps {
  sale: IVendorRecentSale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SaleDetailsDialog: React.FC<SaleDetailsDialogProps> = ({
  sale,
  open,
  onOpenChange,
}) => {
  if (!sale) return null;

  const formatCurrency = (val?: number | null) => {
    return `$${(Number(val) || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (val?: string | Date | null) => {
    if (!val) return "N/A";
    return new Date(val).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "DELIVERED":
        return (
          <Badge className="bg-[#10B981]/10 text-[#10B981] border-transparent font-semibold">
            Delivered
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-[#F59E0B]/10 text-[#D97706] border-transparent font-semibold">
            Pending
          </Badge>
        );
      case "PROCESSING":
        return (
          <Badge className="bg-[#0284C7]/10 text-[#0284C7] border-transparent font-semibold">
            Processing
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge className="bg-[#4F46E5]/10 text-[#4F46E5] border-transparent font-semibold">
            Confirmed
          </Badge>
        );
      case "SHIPPED":
        return (
          <Badge className="bg-[#8B5CF6]/10 text-[#7C3AED] border-transparent font-semibold">
            Shipped
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-[#EF4444]/10 text-[#EF4444] border-transparent font-semibold">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-[#6B7280]/10 text-[#4B5563] border-transparent font-semibold">
            {status || "Unknown"}
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-xl">
        <DialogHeader className="border-b border-[#E5E7EB] pb-4">
          <DialogTitle className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#4F46E5]" />
            Product Sale Details
          </DialogTitle>
          <DialogDescription className="text-sm text-[#4B5563]">
            Comprehensive sale information, product metrics, and customer credentials.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Section A: Transaction & Order Summary */}
          <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-md p-4 space-y-3">
            <h4 className="text-xs font-bold text-[#4B5563] uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-[#4F46E5]" />
              Order Information
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-xs text-[#6B7280] block">Order ID</span>
                <span className="font-mono text-xs font-semibold text-[#0F172A] break-all">
                  {sale.orderId}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#6B7280] block">
                  Transaction ID
                </span>
                <span className="font-mono text-xs font-semibold text-[#4F46E5] break-all">
                  {sale.transactionId}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#6B7280] block">
                  Order Status
                </span>
                <div className="mt-0.5">{getStatusBadge(sale.orderStatus)}</div>
              </div>
              <div>
                <span className="text-xs text-[#6B7280] block">
                  Payment Status
                </span>
                <span className="font-medium text-[#0F172A]">
                  {sale.paymentStatus}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#6B7280] block">
                  Payment Method
                </span>
                <span className="font-medium text-[#0F172A]">
                  {sale.paymentMethod}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#6B7280] block">Order Date</span>
                <span className="font-medium text-[#0F172A] text-xs">
                  {formatDate(sale.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Section B: Customer Details */}
          <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-md p-4 space-y-3">
            <h4 className="text-xs font-bold text-[#4B5563] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#4F46E5]" />
              Customer Information
            </h4>
            <div className="flex items-center gap-4">
              <ProfileAvatar
                src={sale.customer.profileImage}
                alt={sale.customer.name}
                className="w-12 h-12 rounded-full border border-[#E5E7EB] shrink-0"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm flex-1">
                <div>
                  <span className="text-xs text-[#6B7280] block">
                    Customer Name
                  </span>
                  <span className="font-medium text-[#0F172A]">
                    {sale.customer.name}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#6B7280] block">
                    Email Address
                  </span>
                  <span className="font-medium text-[#0F172A]">
                    {sale.customer.email}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section C: Product Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#4B5563] uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-[#4F46E5]" />
              Product Sold
            </h4>
            <div className="border border-[#E5E7EB] rounded-md p-4 bg-white space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {sale.product.image ? (
                    <img
                      src={sale.product.image}
                      alt={sale.product.name}
                      className="w-14 h-14 rounded-md object-cover border border-[#E5E7EB] shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-md bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                      <Package className="w-7 h-7" />
                    </div>
                  )}
                  <div>
                    <h5 className="font-semibold text-sm text-[#0F172A]">
                      {sale.product.name}
                    </h5>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {sale.product.brand && sale.product.brand !== "N/A"
                        ? `Brand: ${sale.product.brand}`
                        : ""}
                      {sale.product.size ? ` • Size: ${sale.product.size}` : ""}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-[#64748B] block">
                    {formatCurrency(sale.product.unitPrice)} × {sale.product.quantity}
                  </span>
                  <span className="font-bold text-base text-[#0F172A]">
                    {formatCurrency(sale.product.itemSubtotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section D: Amount Summary */}
          <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-md p-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#0F172A]">
              Vendor Item Subtotal
            </span>
            <span className="text-lg font-bold text-[#4F46E5]">
              {formatCurrency(sale.amount)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaleDetailsDialog;
