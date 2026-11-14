"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, ShoppingBag } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BuyerAuthGuard } from "@/features/buyer/components/buyer-auth-guard";

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || searchParams.get("orderId");

  return (
    <div className="py-12 sm:py-20">
      <Container className="max-w-lg mx-auto">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 text-center space-y-6 shadow-sm">
          {/* Cancel Icon */}
          <div className="size-16 sm:size-20 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="size-10 sm:size-12" />
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Payment Cancelled
            </h1>
            <p className="text-sm text-muted-foreground">
              You cancelled the Stripe checkout session. Your payment was not processed.
            </p>
          </div>

          {/* Explanation Banner */}
          <div className="rounded-xl bg-muted/40 border border-border/80 p-4 text-xs sm:text-sm text-muted-foreground text-left space-y-2">
            <p>
              • If you changed your mind, you can return to your cart and choose another payment method like Cash on Delivery.
            </p>
            {orderId && (
              <p>
                • Your order reference:{" "}
                <strong className="text-foreground font-mono">
                  #{orderId.slice(-7).toUpperCase()}
                </strong>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/cart" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 font-semibold gap-2">
                <ArrowLeft className="size-4" />
                <span>Return to Cart</span>
              </Button>
            </Link>
            <Link href="/orders" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto gap-2">
                <ShoppingBag className="size-4" />
                <span>My Orders</span>
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <BuyerAuthGuard>
      <React.Suspense
        fallback={
          <Container className="py-16 text-center">
            <Skeleton className="h-64 max-w-md mx-auto rounded-xl" />
          </Container>
        }
      >
        <PaymentCancelContent />
      </React.Suspense>
    </BuyerAuthGuard>
  );
}

