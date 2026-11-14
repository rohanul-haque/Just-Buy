"use client";

import * as React from "react";
import Link from "next/link";
import { useMyOrders } from "@/features/buyer/hooks/use-buyer";
import type { OrderStatus } from "@/features/buyer/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";

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
        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-md bg-amber-500 text-white text-xs sm:text-sm font-semibold tracking-wide">
          Processing
        </span>
      );
    case "DELIVERED":
      return (
        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-md bg-primary text-white text-xs sm:text-sm font-semibold tracking-wide">
          Delivered
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-md bg-slate-400 text-white text-xs sm:text-sm font-semibold tracking-wide">
          Cancelled
        </span>
      );
    case "SHIPPED":
      return (
        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-md bg-blue-500 text-white text-xs sm:text-sm font-semibold tracking-wide">
          Shipped
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-md bg-muted text-muted-foreground text-xs sm:text-sm font-semibold tracking-wide">
          {status}
        </span>
      );
  }
}

export function OrderList() {
  const [page, setPage] = React.useState(1);
  const limit = 10;

  const { data, isLoading, isError, error, refetch } = useMyOrders({
    page,
    limit,
  });

  const orders = data?.orders || [];
  const pagination = data?.pagination;

  if (isLoading) {
    return (
      <div className="space-y-6 w-full">
        <Skeleton className="h-7 w-44 bg-muted" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-card gap-4"
            >
              <div className="flex flex-wrap gap-4 sm:gap-8 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-36" />
              </div>
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load orders"
        message={error?.message || "Could not retrieve your order history."}
        onRetry={() => refetch()}
      />
    );
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-6 w-full">
        <h1 className="text-xl md:text-2xl font-bold text-primary tracking-tight">
          Order History:
        </h1>
        <EmptyState
          icon={<ShoppingBag className="size-7" />}
          title="No orders found"
          description="You haven't placed any orders yet. Discover our latest collections and start shopping!"
          actionLabel="Explore Products"
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Title matching Figma */}
      <h1 className="text-xl md:text-2xl font-bold text-primary tracking-tight">
        Order History:
      </h1>

      {/* Orders Table/List matching Figma */}
      <div className="space-y-2.5">
        {orders.map((order) => {
          const totalProductsCount =
            order.productItems?.reduce(
              (acc, item) => acc + (item.quantity || 1),
              0,
            ) || 0;

          const formattedDate = formatOrderDate(order.createdAt);

          const orderNumber =
            order.transactionNumber || order._id.slice(-7).toUpperCase();

          return (
            <Link
              key={order._id}
              href={`/orders/${order._id}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border/80 bg-card hover:bg-muted/40 transition-all gap-3 sm:gap-4 shadow-2xs group"
            >
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-x-4 gap-y-2 sm:gap-8 text-xs sm:text-sm text-foreground flex-1">
                <span className="font-medium text-foreground">
                  Order No: #{orderNumber}
                </span>
                <span className="text-muted-foreground">
                  Total Products:{" "}
                  <strong className="text-foreground font-semibold">
                    {totalProductsCount}
                  </strong>
                </span>
                <span className="text-muted-foreground">
                  Price:{" "}
                  <strong className="text-foreground font-semibold">
                    ${order.totalAmount.toFixed(2)}
                  </strong>
                </span>
                <span className="text-muted-foreground">
                  Payment:{" "}
                  <strong className="text-foreground font-semibold">
                    {order.orderType === "ONLINE" || order.payment?.paymentMethod === "ONLINE"
                      ? "Stripe"
                      : "COD"}
                  </strong>
                </span>
                <span className="col-span-2 sm:col-span-1 text-muted-foreground">
                  Date: {formattedDate}
                </span>
              </div>

              {/* Status Badge */}
              <div className="shrink-0 self-start sm:self-auto">
                {getStatusBadge(order.status)}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total}{" "}
            orders)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft className="size-4 mr-1" />
              <span>Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNextPage}
            >
              <span>Next</span>
              <ChevronRight className="size-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
