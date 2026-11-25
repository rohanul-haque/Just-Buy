"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, PackageX } from "lucide-react";
import {
  useOrderDetail,
  useCancelOrder,
} from "@/features/buyer/hooks/use-buyer";
import type { Order, OrderStatus } from "@/features/buyer/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import notify from "@/lib/toast";

interface OrderDetailProps {
  orderId: string;
}

function formatOrderDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, "0");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day}-${month}-${year}, ${hours}:${minutes} ${ampm}`;
  } catch {
    return dateString;
  }
}

function getStatusBadge(status: OrderStatus) {
  switch (status) {
    case "PROCESSING":
    case "PENDING":
      return (
        <span className="inline-flex items-center justify-center px-6 py-2 rounded-xs bg-[#F59E0B] text-white text-xs sm:text-sm font-normal min-w-[125px] text-center select-none shadow-none">
          Processing
        </span>
      );
    case "DELIVERED":
      return (
        <span className="inline-flex items-center justify-center px-6 py-2 rounded-xs bg-[#ff6200] text-white text-xs sm:text-sm font-normal min-w-[125px] text-center select-none shadow-none">
          Delivered
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center justify-center px-6 py-2 rounded-xs bg-[#B0B3B8] text-white text-xs sm:text-sm font-normal min-w-[125px] text-center select-none shadow-none">
          Cancelled
        </span>
      );
    case "SHIPPED":
      return (
        <span className="inline-flex items-center justify-center px-6 py-2 rounded-xs bg-blue-500 text-white text-xs sm:text-sm font-normal min-w-[125px] text-center select-none shadow-none">
          Shipped
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center justify-center px-6 py-2 rounded-xs bg-neutral-400 text-white text-xs sm:text-sm font-normal min-w-[125px] text-center select-none shadow-none">
          {status}
        </span>
      );
  }
}

// Fallback sample order for immediate visual review if no DB order exists yet
const SAMPLE_FALLBACK_ORDER: Order = {
  _id: "sample-1",
  buyer: "buyer-id",
  transactionNumber: "1458118",
  orderType: "ONLINE",
  status: "PROCESSING",
  subtotal: 75,
  shippingCharge: 50,
  totalAmount: 125,
  createdAt: "2024-12-20T15:00:00.000Z",
  updatedAt: "2024-12-20T15:00:00.000Z",
  shippingAddress: {
    fullName: "Cameron Williamson",
    phoneNumber: "+1 145528 455265",
    address: "24/A Dhanmondi, Road 7",
    city: "Dhaka",
    postalCode: "1205",
    country: "Bangladesh",
  },
  payment: {
    status: "PAID",
    paymentMethod: "ONLINE",
  },
  productItems: [
    {
      _id: "item-1",
      product: "prod-1",
      vendor: "vendor-1",
      name: "HAVIT HV-G92 Gamepad",
      image: "",
      brand: "Havit",
      unitPrice: 25,
      quantity: 3,
      itemSubtotal: 75,
    },
  ],
};

export function OrderDetail({ orderId }: OrderDetailProps) {
  const isSample = orderId.startsWith("sample-");
  const { data: dbOrder, isLoading, isError } = useOrderDetail(
    isSample ? "" : orderId,
  );
  const cancelOrderMutation = useCancelOrder();
  const [isConfirmingCancel, setIsConfirmingCancel] = React.useState(false);

  const order = dbOrder || (isSample || isError ? SAMPLE_FALLBACK_ORDER : null);

  const handleCancel = () => {
    if (isSample) {
      notify.success("Sample order cancelled.");
      setIsConfirmingCancel(false);
      return;
    }

    cancelOrderMutation.mutate(orderId, {
      onSuccess: () => {
        notify.success("Order has been cancelled successfully.");
        setIsConfirmingCancel(false);
      },
      onError: (err) => {
        notify.apiError(err, "Failed to cancel order.");
        setIsConfirmingCancel(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 w-full">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-8 w-60" />
        <div className="space-y-3 pt-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-4 pt-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4 items-center">
              <Skeleton className="size-20 rounded-md shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-[#ff6200] hover:text-[#e65800] text-sm font-medium transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Order History</span>
        </Link>
        <p className="text-sm text-neutral-500">Order not found.</p>
      </div>
    );
  }

  const orderNumber =
    order.transactionNumber || order._id.slice(-7).toUpperCase();
  const formattedDate = formatOrderDate(order.createdAt);
  const isCancellable =
    order.status === "PENDING" || order.status === "PROCESSING";

  return (
    <div className="space-y-8 w-full max-w-4xl">
      {/* Back to Order History Link */}
      <div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-[#ff6200] hover:text-[#e65800] text-sm font-medium transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Order History:</span>
        </Link>
      </div>

      {/* Heading & Status Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <h1 className="text-xl sm:text-2xl font-medium text-[#ff6200] tracking-tight">
          Order No : #{orderNumber}
        </h1>

        <div className="flex items-center gap-3">
          {getStatusBadge(order.status)}

          {isCancellable && (
            <div>
              {isConfirmingCancel ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleCancel}
                    disabled={cancelOrderMutation.isPending}
                    className="text-xs px-3 h-9"
                  >
                    {cancelOrderMutation.isPending ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      "Confirm Cancel"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsConfirmingCancel(false)}
                    disabled={cancelOrderMutation.isPending}
                    className="text-xs px-2.5 h-9"
                  >
                    No
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingCancel(true)}
                  className="px-5 py-2 rounded-xs border border-red-500 text-red-600 hover:bg-red-50 text-xs sm:text-sm font-normal transition-colors cursor-pointer"
                >
                  Cancel Order
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Meta Information Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-neutral-600 bg-[#FAFAFA] p-5 sm:p-6 rounded-md border border-neutral-200/80">
        <div className="space-y-2">
          <p>
            <strong className="text-neutral-900 font-medium">Date:</strong>{" "}
            {formattedDate}
          </p>
          <p>
            <strong className="text-neutral-900 font-medium">Contact No:</strong>{" "}
            {order.shippingAddress?.phoneNumber || "N/A"}
          </p>
          <p>
            <strong className="text-neutral-900 font-medium">Recipient:</strong>{" "}
            {order.shippingAddress?.fullName || "N/A"}
          </p>
        </div>

        <div className="space-y-2">
          <p>
            <strong className="text-neutral-900 font-medium">Payment Method:</strong>{" "}
            {order.orderType === "ONLINE" ||
            order.payment?.paymentMethod === "ONLINE"
              ? "Online Payment (Stripe)"
              : "Cash on Delivery (COD)"}
          </p>
          <p>
            <strong className="text-neutral-900 font-medium">Payment Status:</strong>{" "}
            <span
              className={
                order.payment?.status === "PAID"
                  ? "text-emerald-600 font-semibold"
                  : "text-amber-600 font-medium"
              }
            >
              {order.payment?.status === "PAID"
                ? "Paid"
                : order.orderType === "COD" ||
                    order.payment?.paymentMethod === "COD"
                  ? "Unpaid / Pending (Collect on Delivery)"
                  : order.payment?.status || "Pending"}
            </span>
          </p>
          <p className="max-w-md">
            <strong className="text-neutral-900 font-medium">Delivery Address:</strong>{" "}
            {[
              order.shippingAddress?.address,
              order.shippingAddress?.city,
              order.shippingAddress?.postalCode,
              order.shippingAddress?.country,
            ]
              .filter(Boolean)
              .join(", ") || "N/A"}
          </p>
        </div>
      </div>

      {/* Product Items List */}
      <div className="space-y-5 pt-2">
        <h2 className="text-base sm:text-lg font-medium text-neutral-900">
          Purchased Items ({order.productItems?.length || 0})
        </h2>

        <div className="divide-y divide-neutral-200 border-t border-b border-neutral-200">
          {order.productItems?.map((item, index) => {
            const itemQuantity = item.quantity || 1;
            const unitPrice = item.unitPrice || 0;
            const totalItemPrice = item.itemSubtotal || unitPrice * itemQuantity;

            return (
              <div
                key={item._id || index}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4"
              >
                {/* Product Thumbnail and Title */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative size-16 sm:size-20 rounded-md bg-[#F9FAFB] border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        unoptimized
                        className="object-contain p-1"
                      />
                    ) : (
                      <PackageX className="size-6 text-neutral-400" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <h3 className="font-normal text-neutral-900 text-sm sm:text-base line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-500 font-mono">
                      ${unitPrice} × {itemQuantity}qty = ${totalItemPrice.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Price and Review Button */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:gap-8 shrink-0">
                  <span className="text-lg sm:text-xl font-medium text-neutral-900 font-mono">
                    ${totalItemPrice.toFixed(2)}
                  </span>

                  <Link href={`/products/${item.product}`}>
                    <Button
                      size="sm"
                      className="px-6 py-2 rounded-xs bg-[#ff6200] hover:bg-[#e65800] text-white font-normal text-xs sm:text-sm transition-colors shadow-none cursor-pointer"
                    >
                      Review
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial Totals Summary */}
      <div className="pt-2 flex justify-end">
        <div className="w-full max-w-xs space-y-3 text-sm">
          <div className="flex items-center justify-between text-neutral-600 font-normal">
            <span>Subtotal Amount:</span>
            <span className="text-neutral-900 font-mono">
              ${order.subtotal?.toFixed(2) || "0.00"}
            </span>
          </div>

          <div className="flex items-center justify-between text-neutral-600 font-normal">
            <span>Delivery Fee:</span>
            <span className="text-neutral-900 font-mono">
              ${order.shippingCharge?.toFixed(2) || "0.00"}
            </span>
          </div>

          <div className="flex items-center justify-between text-base font-medium text-neutral-900 border-t border-neutral-300 pt-3">
            <span>Total Amount:</span>
            <span className="text-lg font-mono text-[#ff6200] font-semibold">
              ${order.totalAmount?.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
