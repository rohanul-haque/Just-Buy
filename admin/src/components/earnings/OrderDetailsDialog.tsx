import earningsService from "@/api/services/earnings.service";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { IEarningsTransactionDetails } from "@/types/earnings";
import {
  CheckCircle2,
  CreditCard,
  MapPin,
  Package,
  Receipt,
  Store,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface OrderDetailsDialogProps {
  open: boolean;
  orderId: string | null;
  onOpenChange: (open: boolean) => void;
}

export const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  open,
  orderId,
  onOpenChange,
}) => {
  const [details, setDetails] = useState<IEarningsTransactionDetails | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!open || !orderId) {
      setDetails(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    earningsService
      .getEarningsTransactionDetails(orderId)
      .then((res) => {
        if (isMounted) {
          setDetails(res.data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          toast.error(
            err.response?.data?.message ||
              "Failed to load delivered order details",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [open, orderId]);

  const formatCurrency = (val?: number) => {
    return `৳${(Number(val) || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (val?: string | Date) => {
    if (!val) return "N/A";
    return new Date(val).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-md border border-[#E5E7EB] bg-white p-6 shadow-xl">
        <DialogHeader className="border-b border-[#E5E7EB] pb-4">
          <DialogTitle className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#4F46E5]" />
            Delivered Order & Commission Details
          </DialogTitle>
          <DialogDescription className="text-sm text-[#4B5563]">
            Complete breakdown of transaction information, buyer credentials, product items, and commission distribution.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-6 py-4">
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-28 w-full rounded-md" />
            <Skeleton className="h-44 w-full rounded-md" />
          </div>
        ) : !details ? (
          <div className="py-12 text-center text-[#6B7280]">
            Order details could not be found or loaded.
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Section A: Transaction Information */}
            <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-md p-4 space-y-3">
              <h4 className="text-xs font-bold text-[#4B5563] uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#4F46E5]" />
                Transaction Information
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-xs text-[#6B7280] block">Order ID</span>
                  <span className="font-mono text-xs font-semibold text-[#0F172A] break-all">
                    {details.transaction.orderId}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#6B7280] block">
                    Transaction ID
                  </span>
                  <span className="font-mono text-xs font-semibold text-[#4F46E5] break-all">
                    {details.transaction.transactionId}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#6B7280] block">
                    Order Status
                  </span>
                  <Badge className="bg-[#10B981]/10 text-[#10B981] border-transparent font-semibold text-xs mt-0.5">
                    <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                    {details.transaction.orderStatus}
                  </Badge>
                </div>
                <div>
                  <span className="text-xs text-[#6B7280] block">
                    Payment Status
                  </span>
                  <span className="font-medium text-[#0F172A]">
                    {details.transaction.paymentStatus}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#6B7280] block">
                    Payment Method
                  </span>
                  <span className="font-medium text-[#0F172A]">
                    {details.transaction.paymentMethod}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#6B7280] block">
                    Delivered Date
                  </span>
                  <span className="font-medium text-[#0F172A] text-xs">
                    {formatDate(details.transaction.deliveredDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Section B: Buyer Information */}
            <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-md p-4 space-y-3">
              <h4 className="text-xs font-bold text-[#4B5563] uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#4F46E5]" />
                Buyer Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-[#6B7280] block">Full Name</span>
                  <span className="font-medium text-[#0F172A]">
                    {details.buyer.name}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#6B7280] block">
                    Email Address
                  </span>
                  <span className="font-medium text-[#0F172A]">
                    {details.buyer.email}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#6B7280] block">
                    Phone Number
                  </span>
                  <span className="font-medium text-[#0F172A]">
                    {details.buyer.phoneNumber}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#6B7280] block flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#6B7280]" />
                    Delivery Address
                  </span>
                  <span className="font-medium text-[#0F172A] text-xs">
                    {details.buyer.address}
                  </span>
                </div>
              </div>
            </div>

            {/* Sections C & D: Product & Commission Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#4B5563] uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-[#4F46E5]" />
                Product & Commission Breakdown
              </h4>

              <div className="border border-[#E5E7EB] rounded-md overflow-hidden divide-y divide-[#E5E7EB]">
                {details.items.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white hover:bg-[#F8FAFC] transition-colors space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-12 h-12 rounded-md object-cover border border-[#E5E7EB] shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-sm text-[#0F172A] leading-tight">
                            {item.productName}
                          </p>
                          <p className="text-xs text-[#6B7280] mt-0.5 flex items-center gap-1">
                            <Store className="w-3 h-3" />
                            {item.vendorName}
                            {item.brand && item.brand !== "N/A"
                              ? ` • ${item.brand}`
                              : ""}
                            {item.size ? ` • Size: ${item.size}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs text-[#6B7280] block">
                          {formatCurrency(item.unitPrice)} × {item.quantity}
                        </span>
                        <span className="font-bold text-sm text-[#0F172A]">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    </div>

                    {/* Commission breakdown cards for item */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#F1F5F9] text-xs">
                      <div className="bg-[#ECFDF5] border border-[#D1FAE5] rounded-md p-2">
                        <span className="text-[#059669] font-medium block">
                          Admin Commission ({item.commissionRate}%)
                        </span>
                        <span className="font-bold text-sm text-[#047857]">
                          {formatCurrency(item.adminCommission)}
                        </span>
                      </div>

                      <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-md p-2">
                        <span className="text-[#1D4ED8] font-medium block">
                          Vendor Earnings ({item.vendorCommissionRate}%)
                        </span>
                        <span className="font-bold text-sm text-[#1E40AF]">
                          {formatCurrency(item.vendorEarnings)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section E: Order Summary */}
            <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-md p-4 space-y-2">
              <h4 className="text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2">
                Order Financial Summary
              </h4>

              <div className="space-y-1.5 text-sm text-[#374151]">
                <div className="flex justify-between">
                  <span>Eligible Product Subtotal:</span>
                  <span className="font-medium text-[#0F172A]">
                    {formatCurrency(details.summary.totalProductAmount)}
                  </span>
                </div>

                <div className="flex justify-between text-[#059669] bg-[#ECFDF5] px-2 py-1 rounded-md font-medium">
                  <span>Total Admin Commission (15%):</span>
                  <span className="font-bold text-[#047857]">
                    {formatCurrency(details.summary.totalAdminCommission)}
                  </span>
                </div>

                <div className="flex justify-between text-[#1D4ED8] px-2 py-0.5">
                  <span>Total Vendor Earnings (85%):</span>
                  <span className="font-medium">
                    {formatCurrency(details.summary.totalVendorEarnings)}
                  </span>
                </div>

                <div className="flex justify-between px-2 py-0.5">
                  <span>Shipping Charge:</span>
                  <span>{formatCurrency(details.summary.shippingCharge)}</span>
                </div>

                {details.summary.discount > 0 && (
                  <div className="flex justify-between text-[#DC2626] px-2 py-0.5">
                    <span>Discount:</span>
                    <span>-{formatCurrency(details.summary.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between border-t border-[#E5E7EB] pt-2 mt-1 text-base font-bold text-[#0F172A]">
                  <span>Final Order Total:</span>
                  <span className="text-[#4F46E5]">
                    {formatCurrency(details.summary.finalOrderTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
