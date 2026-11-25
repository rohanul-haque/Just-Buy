"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  ShoppingBag,
  RotateCw,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BuyerAuthGuard } from "@/features/buyer/components/buyer-auth-guard";
import {
  useVerifySession,
  BUYER_ORDERS_KEY,
} from "@/features/buyer/hooks/use-buyer";
import { useQueryClient } from "@tanstack/react-query";
import { CART_QUERY_KEY } from "@/features/cart/hooks/use-cart";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId =
    searchParams.get("session_id") || searchParams.get("sessionId");
  const orderId = searchParams.get("order_id") || searchParams.get("orderId");
  const queryClient = useQueryClient();

  const {
    data: result,
    isLoading,
    isError,
    error,
    refetch,
  } = useVerifySession(sessionId);

  // Invalidate queries when payment is successfully verified
  React.useEffect(() => {
    if (result && result.status === "PAID") {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BUYER_ORDERS_KEY });
      if (result.order?._id) {
        queryClient.invalidateQueries({
          queryKey: ["orders", "detail", result.order._id],
        });
      }
    }
  }, [result, queryClient]);

  const targetOrderId = result?.order?._id || orderId;

  if (isLoading) {
    return (
      <div className="py-12 sm:py-20 bg-white min-h-[calc(100vh-12rem)] flex items-center">
        <Container className="max-w-lg mx-auto">
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 sm:p-10 text-center space-y-4 shadow-none">
            <Loader2 className="size-12 animate-spin text-[#ff6200] mx-auto" />
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
              Verifying Online Payment...
            </h1>
            <p className="text-sm text-neutral-500">
              Please wait while we confirm your payment transaction with Stripe.
            </p>
          </div>
        </Container>
      </div>
    );
  }

  if (isError || !result) {
    return (
      <div className="py-12 sm:py-20 bg-white min-h-[calc(100vh-12rem)] flex items-center">
        <Container className="max-w-lg mx-auto">
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 sm:p-10 text-center space-y-6 shadow-none">
            <div className="size-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="size-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
                Verification Incomplete
              </h1>
              <p className="text-sm text-neutral-500 leading-relaxed">
                {error?.message ||
                  "We could not verify the payment session immediately. Your payment may still be processing."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => refetch()}
                className="w-full sm:w-auto h-11 px-6 rounded-md border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 font-semibold gap-2 cursor-pointer"
              >
                <RotateCw className="size-4" />
                <span>Retry Verification</span>
              </Button>
              <Link
                href={targetOrderId ? `/orders/${targetOrderId}` : "/orders"}
                className="w-full sm:w-auto"
              >
                <Button className="w-full sm:w-auto h-11 px-6 rounded-md bg-[#ff6200] hover:bg-[#e55800] active:bg-[#cc4e00] text-white font-semibold gap-2 border-0 cursor-pointer">
                  <span>View Order Status</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  const isPaid = result.status === "PAID";

  return (
    <div className="py-12 sm:py-20 bg-white min-h-[calc(100vh-12rem)] flex items-center">
      <Container className="max-w-xl mx-auto">
        <div className="rounded-2xl border border-neutral-200 border-t-[3px] border-t-[#ff6200] bg-white p-6 sm:p-10 text-center space-y-6 shadow-none">
          {/* Status Icon */}
          <div
            className={`size-16 sm:size-20 rounded-full flex items-center justify-center mx-auto ${
              isPaid
                ? "bg-emerald-50 text-emerald-600"
                : "bg-amber-50 text-amber-600"
            }`}
          >
            {isPaid ? (
              <CheckCircle2 className="size-10 sm:size-11" />
            ) : (
              <AlertCircle className="size-10 sm:size-11" />
            )}
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              {isPaid
                ? "Payment Verified & Order Confirmed!"
                : `Payment Status: ${result.status}`}
            </h1>
            <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
              {isPaid
                ? "Thank you for your purchase. Your online payment has been confirmed and your order is now in progress."
                : result.message ||
                  "Your payment is currently being processed."}
            </p>
          </div>

          {/* Transaction Metadata Card */}
          <div className="rounded-xl bg-neutral-50/80 border border-neutral-200/80 p-4 sm:p-5 text-xs sm:text-sm text-left divide-y divide-neutral-200/70">
            {result.order?.transactionNumber && (
              <div className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <span className="text-neutral-500">Transaction Number</span>
                <span className="font-mono font-semibold text-neutral-900">
                  {result.order.transactionNumber}
                </span>
              </div>
            )}
            {targetOrderId && (
              <div className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <span className="text-neutral-500">Order ID</span>
                <span className="font-mono font-semibold text-neutral-900">
                  #{targetOrderId.slice(-7).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
              <span className="text-neutral-500">Amount Paid</span>
              <span className="font-mono font-bold text-neutral-900">
                $
                {result.payment?.amount?.toFixed(2) ||
                  result.order?.totalAmount?.toFixed(2) ||
                  "0.00"}{" "}
                <span className="uppercase text-[11px] text-neutral-500 font-sans">
                  {result.payment?.currency || "USD"}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
              <span className="text-neutral-500">Payment Status</span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  isPaid
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {result.status}
              </span>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={targetOrderId ? `/orders/${targetOrderId}` : "/orders"}
              className="w-full sm:w-auto"
            >
              <Button className="w-full sm:w-auto h-11 px-7 rounded-md bg-[#ff6200] hover:bg-[#e55800] active:bg-[#cc4e00] text-white font-semibold gap-2 border-0 transition-colors cursor-pointer">
                <span>
                  {targetOrderId ? "View Order Details" : "View My Orders"}
                </span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/products" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-11 px-7 rounded-md border border-[#ff6200] text-[#ff6200] hover:bg-orange-50 hover:text-[#e55800] bg-white font-semibold gap-2 transition-colors cursor-pointer"
              >
                <ShoppingBag className="size-4" />
                <span>Continue Shopping</span>
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <BuyerAuthGuard>
      <React.Suspense
        fallback={
          <Container className="py-16 text-center">
            <Skeleton className="h-64 max-w-md mx-auto rounded-xl" />
          </Container>
        }
      >
        <PaymentSuccessContent />
      </React.Suspense>
    </BuyerAuthGuard>
  );
}
