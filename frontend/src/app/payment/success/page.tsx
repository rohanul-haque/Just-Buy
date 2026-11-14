"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BuyerAuthGuard } from "@/features/buyer/components/buyer-auth-guard";
import { useVerifySession } from "@/features/buyer/hooks/use-buyer";
import { useQueryClient } from "@tanstack/react-query";
import { CART_QUERY_KEY } from "@/features/cart/hooks/use-cart";
import { BUYER_ORDERS_KEY } from "@/features/buyer/hooks/use-buyer";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || searchParams.get("sessionId");
  const orderId = searchParams.get("order_id") || searchParams.get("orderId");
  const queryClient = useQueryClient();

  const { data: result, isLoading, isError, error, refetch } = useVerifySession(sessionId);

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
      <Container className="py-16 sm:py-24 max-w-lg mx-auto text-center space-y-4">
        <Loader2 className="size-12 animate-spin text-primary mx-auto" />
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          Verifying Online Payment...
        </h1>
        <p className="text-sm text-muted-foreground">
          Please wait while we confirm your payment transaction with Stripe.
        </p>
      </Container>
    );
  }

  if (isError || !result) {
    return (
      <Container className="py-16 sm:py-24 max-w-lg mx-auto text-center space-y-6">
        <div className="size-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="size-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Verification Incomplete
          </h1>
          <p className="text-sm text-muted-foreground">
            {error?.message ||
              "We could not verify the payment session immediately. Your payment may still be processing."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Retry Verification
          </Button>
          {targetOrderId && (
            <Link href={`/orders/${targetOrderId}`}>
              <Button size="sm">View Order Status</Button>
            </Link>
          )}
        </div>
      </Container>
    );
  }

  const isPaid = result.status === "PAID";

  return (
    <div className="py-12 sm:py-20">
      <Container className="max-w-xl mx-auto">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 text-center space-y-6 shadow-sm">
          {/* Status Icon */}
          <div
            className={`size-16 sm:size-20 rounded-full flex items-center justify-center mx-auto ${
              isPaid
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            }`}
          >
            {isPaid ? (
              <CheckCircle2 className="size-10 sm:size-12" />
            ) : (
              <AlertCircle className="size-10 sm:size-12" />
            )}
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {isPaid ? "Payment Verified & Order Confirmed!" : "Payment Status: " + result.status}
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {isPaid
                ? "Thank you for your purchase. Your online payment has been confirmed by Stripe and your order is now in progress."
                : result.message || "Your payment is currently being processed."}
            </p>
          </div>

          {/* Transaction Metadata Card */}
          <div className="rounded-xl bg-muted/40 border border-border/80 p-4 text-xs sm:text-sm text-left space-y-2.5 divide-y divide-border/50">
            {result.order?.transactionNumber && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-muted-foreground">Transaction Number:</span>
                <span className="font-mono font-semibold text-foreground">
                  {result.order.transactionNumber}
                </span>
              </div>
            )}
            {targetOrderId && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono text-foreground font-semibold">
                  #{targetOrderId.slice(-7).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2">
              <span className="text-muted-foreground">Amount Paid:</span>
              <span className="font-mono font-bold text-foreground">
                ${result.payment?.amount?.toFixed(2) || result.order?.totalAmount?.toFixed(2) || "0.00"}{" "}
                <span className="uppercase text-[11px] text-muted-foreground">
                  {result.payment?.currency || "BDT"}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-muted-foreground">Payment Status:</span>
              <span
                className={`font-semibold ${
                  isPaid ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {result.status}
              </span>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {targetOrderId && (
              <Link href={`/orders/${targetOrderId}`} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 font-semibold gap-2">
                  <span>View Order Details</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            )}
            <Link href="/products" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                Continue Shopping
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
