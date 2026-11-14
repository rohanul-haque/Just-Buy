"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, PackageX } from "lucide-react";
import {
  useOrderDetail,
  useCancelOrder,
} from "@/features/buyer/hooks/use-buyer";
import type { OrderStatus } from "@/features/buyer/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
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
        <span className="inline-flex items-center justify-center px-5 py-2 rounded-md bg-amber-500 text-white text-sm font-semibold tracking-wide">
          Processing
        </span>
      );
    case "DELIVERED":
      return (
        <span className="inline-flex items-center justify-center px-5 py-2 rounded-md bg-primary text-white text-sm font-semibold tracking-wide">
          Delivered
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center justify-center px-5 py-2 rounded-md bg-slate-400 text-white text-sm font-semibold tracking-wide">
          Cancelled
        </span>
      );
    case "SHIPPED":
      return (
        <span className="inline-flex items-center justify-center px-5 py-2 rounded-md bg-blue-500 text-white text-sm font-semibold tracking-wide">
          Shipped
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center justify-center px-5 py-2 rounded-md bg-muted text-muted-foreground text-sm font-semibold tracking-wide">
          {status}
        </span>
      );
  }
}

export function OrderDetail({ orderId }: OrderDetailProps) {
  const { data: order, isLoading, isError, error, refetch } =
    useOrderDetail(orderId);
  const cancelOrderMutation = useCancelOrder();
  const [isConfirmingCancel, setIsConfirmingCancel] = React.useState(false);

  const handleCancel = () => {
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
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-64" />
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-60" />
          </div>
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
        <div className="space-y-4 pt-4 border-t border-border">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4 items-center">
              <Skeleton className="size-20 rounded-md shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <ErrorState
        title="Order not found"
        message={error?.message || "Could not retrieve order details."}
        onRetry={() => refetch()}
      />
    );
  }

  const orderNumber =
    order.transactionNumber || order._id.slice(-7).toUpperCase();
  const formattedDate = formatOrderDate(order.createdAt);
  const isCancellable =
    order.status === "PENDING" || order.status === "PROCESSING";

  return (
    <div className="space-y-6 w-full">
      {/* Back to Order History Link matching Figma */}
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 text-primary hover:underline font-semibold text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        <span>Order History:</span>
      </Link>

      {/* Large Orange Heading matching Figma */}
      <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
        Order No : #{orderNumber}
      </h1>

      {/* Meta Information and Status Actions matching Figma */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-border/80">
        <div className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground font-medium">Date:</strong>{" "}
            {formattedDate}
          </p>
          <p>
            <strong className="text-foreground font-medium">Contact No:</strong>{" "}
            {order.shippingAddress?.phoneNumber || "N/A"}
          </p>
          <p className="max-w-md">
            <strong className="text-foreground font-medium">Address:</strong>{" "}
            {[
              order.shippingAddress?.address,
              order.shippingAddress?.city,
              order.shippingAddress?.postalCode,
              order.shippingAddress?.country,
            ]
              .filter(Boolean)
              .join(", ") || "N/A"}
          </p>
          <p>
            <strong className="text-foreground font-medium">Payment Method:</strong>{" "}
            {order.orderType === "ONLINE" || order.payment?.paymentMethod === "ONLINE"
              ? "Online Payment (Stripe)"
              : "Cash on Delivery (COD)"}
          </p>
          <p>
            <strong className="text-foreground font-medium">Payment Status:</strong>{" "}
            <span
              className={
                order.payment?.status === "PAID"
                  ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                  : "text-amber-600 dark:text-amber-400 font-medium"
              }
            >
              {order.payment?.status === "PAID"
                ? "Paid"
                : order.orderType === "COD" || order.payment?.paymentMethod === "COD"
                  ? "Unpaid / Pending (Collect on Delivery)"
                  : order.payment?.status || "Pending"}
            </span>
          </p>
        </div>

        {/* Status Badge + Cancel Action */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 shrink-0">
          {getStatusBadge(order.status)}

          {isCancellable && (
            <div>
              {isConfirmingCancel ? (
                <div className="flex items-center gap-2 animate-in fade-in-0 duration-150">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleCancel}
                    disabled={cancelOrderMutation.isPending}
                    className="text-xs px-3"
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
                    className="text-xs px-2"
                  >
                    No
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingCancel(true)}
                  className="px-6 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm font-semibold transition-colors shadow-2xs"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Items List matching Figma */}
      <div className="space-y-6 pt-2">
        {order.productItems?.map((item, index) => {
          const itemQuantity = item.quantity || 1;
          const unitPrice = item.unitPrice || 0;
          const totalItemPrice =
            item.itemSubtotal || unitPrice * itemQuantity;

          return (
            <div
              key={item._id || index}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/60"
            >
              {/* Product Thumbnail and Title */}
              <div className="flex items-center gap-4">
                <div className="relative size-20 sm:size-24 rounded-lg bg-muted/40 border border-border/80 overflow-hidden shrink-0 flex items-center justify-center">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      unoptimized
                      className="object-contain p-1"
                    />
                  ) : (
                    <PackageX className="size-8 text-muted-foreground" />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">
                    {item.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-indigo-900/80 dark:text-indigo-300 font-mono">
                    ${unitPrice} * {itemQuantity}qty = ${totalItemPrice.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Price and Review Button */}
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:gap-8">
                <span className="text-xl sm:text-2xl font-bold text-primary font-mono">
                  ${totalItemPrice.toFixed(2)}
                </span>

                <Link href={`/products/${item.product}`}>
                  <Button
                    size="sm"
                    className="px-6 py-2 rounded-md font-semibold text-xs sm:text-sm"
                  >
                    Review
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Totals Summary matching Figma */}
      <div className="pt-4 flex justify-end">
        <div className="w-full max-w-xs space-y-3 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Subtotal Amount</span>
            <span className="font-semibold text-foreground font-mono">
              ${order.subtotal?.toFixed(2) || "0.00"}
            </span>
          </div>

          <div className="flex items-center justify-between text-muted-foreground">
            <span>Delivery Fee</span>
            <span className="font-semibold text-foreground font-mono">
              ${order.shippingCharge?.toFixed(2) || "0.00"}
            </span>
          </div>

          <div className="flex items-center justify-between text-base font-bold text-foreground border-t border-border pt-3">
            <span>Total Amount</span>
            <span className="text-lg font-mono text-foreground">
              ${order.totalAmount?.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

