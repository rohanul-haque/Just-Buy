import React from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { IOrder, OrderStatus, PaymentStatus } from "@/types/order";

interface OrderDetailsDialogProps {
  order: IOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmCODPayment?: (orderId: string) => Promise<void>;
  isConfirmingCOD?: boolean;
}

export const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  order,
  open,
  onOpenChange,
  onConfirmCODPayment,
  isConfirmingCOD = false,
}) => {
  if (!order) return null;

  const items = order.productItems || [];
  const vendorSubtotal =
    items.length > 0
      ? items.reduce(
          (sum, item) =>
            sum +
            (Number(item.itemSubtotal) ||
              Number(item.unitPrice * item.quantity) ||
              0),
          0,
        )
      : Number(order.subtotal || 0);

  const formatCurrency = (amount: number | undefined | null) => {
    const validAmount = Number(amount) || 0;
    return `৳${validAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]">
            Pending
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge className="bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]">
            Confirmed
          </Badge>
        );
      case "PROCESSING":
        return (
          <Badge className="bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]">
            Processing
          </Badge>
        );
      case "SHIPPED":
        return (
          <Badge className="bg-[#ECFEFF] text-[#0891B2] border-[#A5F3FC]">
            Shipped
          </Badge>
        );
      case "DELIVERED":
        return (
          <Badge className="bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]">
            Delivered
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status?: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return (
          <Badge className="bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]">
            Paid
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]">
            Pending
          </Badge>
        );
      case "UNPAID":
        return (
          <Badge className="bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3]">
            Unpaid
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]">
            Failed
          </Badge>
        );
      case "REFUNDED":
        return (
          <Badge className="bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]">
            Refunded
          </Badge>
        );
      default:
        return <Badge variant="outline">{status || "Pending"}</Badge>;
    }
  };

  const isCOD =
    order.orderType === "COD" || order.payment?.paymentMethod === "COD";
  const transactionId =
    order.transactionNumber ||
    (order.payment as any)?.stripePaymentIntentId ||
    (order.payment as any)?._id ||
    "";
  const isPaymentPaid = order.payment?.status === "PAID";
  const isEligibleForCODConfirm =
    isCOD && order.status === "DELIVERED" && !isPaymentPaid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-[#FFE7D9] border border-[#ffceb0]/80 rounded-2xl shadow-xl">
        <DialogHeader className="border-b border-[#ffceb0]/80 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <DialogTitle className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
                <Package className="w-5 h-5 text-[#fe6201]" />
                Order #{order._id}
              </DialogTitle>
              <div className="flex items-center gap-2 text-xs text-[#6B7280] mt-1">
                <Calendar className="w-3.5 h-3.5 text-[#fe6201]" />
                <span>
                  Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
                  {new Date(order.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getOrderStatusBadge(order.status)}
              {getPaymentStatusBadge(order.payment?.status)}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Section 1: Order & Financial Summary */}
          <div className="p-4 rounded-xl bg-white/80 border border-[#ffceb0]/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ffceb0]/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#fe6201]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7C2D12]">
                    Payment Method:
                  </span>
                  <span className="text-sm font-semibold text-[#1F2937]">
                    {isCOD ? "Cash on Delivery (COD)" : "Online Payment"}
                  </span>
                </div>
                <div className="text-xs text-[#6B7280] flex items-center gap-1.5 pt-0.5">
                  <Clock className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  <span>Payment Status:</span>
                  {getPaymentStatusBadge(order.payment?.status)}
                  {order.payment?.paidAt && (
                    <span className="text-[#059669] ml-1 font-medium">
                      (Paid on{" "}
                      {new Date(order.payment.paidAt).toLocaleDateString()})
                    </span>
                  )}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-[#6B7280] block">
                  Vendor Items Amount:
                </span>
                <span className="text-lg font-bold text-[#fe6201]">
                  {formatCurrency(vendorSubtotal)}
                </span>
              </div>
            </div>

            {/* Full Transaction ID */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
              <div className="flex items-center gap-1.5 text-[#6B7280]">
                <Hash className="w-3.5 h-3.5 text-[#fe6201]" />
                <span className="font-semibold text-[#7C2D12]">Full Transaction ID:</span>
                <span className="font-mono text-[#1F2937] select-all font-semibold">
                  {transactionId || "—"}
                </span>
              </div>

              {/* COD Confirm Payment Action inside Dialog if eligible */}
              {isEligibleForCODConfirm && onConfirmCODPayment && (
                <Button
                  size="sm"
                  onClick={() => onConfirmCODPayment(order._id)}
                  disabled={isConfirmingCOD}
                  className="h-8 px-3 text-xs bg-[#fe6201] hover:bg-[#e05500] text-white rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  {isConfirmingCOD ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  Confirm Payment Received
                </Button>
              )}
            </div>
          </div>

          {/* Section 2: Customer & Shipping Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="p-4 rounded-xl bg-white/80 border border-[#ffceb0]/80 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7C2D12] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#fe6201]" /> Customer Details
              </h4>
              <p className="text-sm font-semibold text-[#1F2937]">
                {order.buyer?.name ||
                  order.shippingAddress?.fullName ||
                  "Valued Customer"}
              </p>
              {order.buyer?.email && (
                <p className="text-xs text-[#4B5563] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  {order.buyer.email}
                </p>
              )}
              {order.shippingAddress?.phoneNumber && (
                <p className="text-xs text-[#4B5563] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  {order.shippingAddress.phoneNumber}
                </p>
              )}
            </div>

            {/* Shipping Address */}
            <div className="p-4 rounded-xl bg-white/80 border border-[#ffceb0]/80 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7C2D12] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#fe6201]" /> Shipping Address
              </h4>
              <p className="text-sm font-semibold text-[#1F2937]">
                {order.shippingAddress?.fullName}
              </p>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                {order.shippingAddress?.address}
                {order.shippingAddress?.city
                  ? `, ${order.shippingAddress.city}`
                  : ""}
                {order.shippingAddress?.postalCode
                  ? ` - ${order.shippingAddress.postalCode}`
                  : ""}
              </p>
              {order.deliveredAt && (
                <p className="text-xs text-[#059669] flex items-center gap-1.5 mt-2 font-medium">
                  <Truck className="w-3.5 h-3.5" />
                  Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Ordered Products (Vendor Items Only) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7C2D12] flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#fe6201]" />
              Your Order Items ({items.length})
            </h4>

            <div className="border border-[#ffceb0]/80 rounded-xl divide-y divide-[#ffceb0]/60 overflow-hidden bg-white/80">
              {items.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="p-3.5 flex items-center gap-4 bg-transparent hover:bg-[#FFE7D9]/40 transition-colors"
                >
                  <div className="w-14 h-14 rounded-xl border border-[#ffceb0]/80 bg-[#FFE7D9] overflow-hidden shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-[#9CA3AF]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1F2937] truncate">
                      {item.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B7280] mt-0.5">
                      {item.brand && <span>Brand: {item.brand}</span>}
                      {item.size && <span>Size: {item.size}</span>}
                      <span>Quantity: {item.quantity}</span>
                      <span>Unit Price: {formatCurrency(item.unitPrice)}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[#fe6201]">
                      {formatCurrency(
                        Number(item.itemSubtotal) ||
                          Number(item.unitPrice * item.quantity),
                      )}
                    </p>
                    <span className="text-[11px] text-[#6B7280]">Subtotal</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
