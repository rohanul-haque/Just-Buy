"use client";

import * as React from "react";
import Link from "next/link";
import { useMyOrders } from "@/features/buyer/hooks/use-buyer";
import type { OrderStatus } from "@/features/buyer/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";

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

function getStatusButton(status: OrderStatus) {
  switch (status) {
    case "PROCESSING":
    case "PENDING":
      return (
        <span className="inline-flex items-center justify-center px-6 py-2.5 rounded-xs bg-[#F59E0B] text-white text-xs sm:text-sm font-normal min-w-[125px] sm:min-w-[135px] text-center shadow-none select-none">
          Processing
        </span>
      );
    case "DELIVERED":
      return (
        <span className="inline-flex items-center justify-center px-6 py-2.5 rounded-xs bg-[#ff6200] text-white text-xs sm:text-sm font-normal min-w-[125px] sm:min-w-[135px] text-center shadow-none select-none">
          Delivered
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center justify-center px-6 py-2.5 rounded-xs bg-[#B0B3B8] text-white text-xs sm:text-sm font-normal min-w-[125px] sm:min-w-[135px] text-center shadow-none select-none">
          Cancelled
        </span>
      );
    case "SHIPPED":
      return (
        <span className="inline-flex items-center justify-center px-6 py-2.5 rounded-xs bg-blue-500 text-white text-xs sm:text-sm font-normal min-w-[125px] sm:min-w-[135px] text-center shadow-none select-none">
          Shipped
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center justify-center px-6 py-2.5 rounded-xs bg-neutral-400 text-white text-xs sm:text-sm font-normal min-w-[125px] sm:min-w-[135px] text-center shadow-none select-none">
          {status}
        </span>
      );
  }
}

export function OrderList() {
  const [page, setPage] = React.useState(1);
  const limit = 6; // User requested 6 items per page

  const { data, isLoading } = useMyOrders({
    page,
    limit,
  });

  const dbOrders = data?.orders || [];
  const pagination = data?.pagination;

  const displayOrders = dbOrders.map((order) => ({
    _id: order._id,
    orderNo: order.transactionNumber
      ? `#${order.transactionNumber}`
      : `#${order._id.slice(-7).toUpperCase()}`,
    totalProducts:
      order.productItems?.reduce(
        (acc, item) => acc + (item.quantity || 1),
        0,
      ) || order.productItems?.length || 1,
    price: order.totalAmount,
    date: formatOrderDate(order.createdAt),
    status: order.status,
  }));

  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || page;

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <Skeleton className="h-7 w-48 bg-muted" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-xs border border-neutral-100 bg-white gap-4"
            >
              <div className="flex flex-wrap gap-8 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-36" />
              </div>
              <Skeleton className="h-10 w-32 rounded-xs" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Title matching mockup */}
      <h1 className="text-xl sm:text-2xl font-medium text-[#ff6200] tracking-tight">
        Order History:
      </h1>

      {/* Empty State when no orders exist */}
      {displayOrders.length === 0 ? (
        <div className="w-full border border-neutral-200 rounded-2xl bg-white py-10 sm:py-14 px-6 sm:px-8 text-center flex flex-col items-center justify-center shadow-xs">
          <div className="size-14 sm:size-16 rounded-full bg-orange-50 text-[#ff6200] flex items-center justify-center mb-4">
            <ShoppingBag className="size-7 sm:size-8 stroke-[1.5]" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
            No Orders Yet
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1.5 mb-6 leading-relaxed max-w-sm">
            You haven&apos;t placed any orders yet. Explore our products and place your first order!
          </p>
          <Link
            href="/products"
            className="bg-[#ff6200] hover:bg-[#e65800] text-white px-7 py-2.5 rounded-xs text-xs sm:text-sm font-medium transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Browse Products</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <>
          {/* Orders List */}
          <div className="space-y-3 sm:space-y-3.5">
            {displayOrders.map((order) => {
              const rowContent = (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 sm:py-4 px-4 sm:px-6 rounded-xs transition-colors gap-3 sm:gap-6 bg-white hover:bg-[#F9FAFB]">
                  {/* Order Meta details */}
                  <div className="flex flex-wrap items-center gap-x-6 sm:gap-x-10 lg:gap-x-12 gap-y-2 text-xs sm:text-sm lg:text-[15px] text-neutral-600 font-normal flex-1">
                    <span className="whitespace-nowrap">
                      Order No: {order.orderNo}
                    </span>

                    <span className="whitespace-nowrap">
                      Total Products: {order.totalProducts}
                    </span>

                    <span className="whitespace-nowrap font-medium text-neutral-800">
                      Price: ${order.price}
                    </span>

                    <span className="whitespace-nowrap text-neutral-600">
                      Date: {order.date}
                    </span>
                  </div>

                  {/* Status Action / Button on Right */}
                  <div className="shrink-0 self-end sm:self-center">
                    {getStatusButton(order.status)}
                  </div>
                </div>
              );

              return (
                <Link
                  key={order._id}
                  href={`/orders/${order._id}`}
                  className="block cursor-pointer"
                >
                  {rowContent}
                </Link>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 sm:pt-8">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage <= 1}
                className="size-9 rounded-sm border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft className="size-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    className={`size-9 rounded-sm text-sm font-medium transition-colors cursor-pointer flex items-center justify-center ${
                      currentPage === pageNum
                        ? "bg-[#ff6200] text-white"
                        : "border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ),
              )}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="size-9 rounded-sm border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Next Page"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
