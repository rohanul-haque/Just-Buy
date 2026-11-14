"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Trash2, ShoppingBag, Plus, Minus, ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useCurrentUser } from "@/features/auth/hooks/use-auth";
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
} from "@/features/cart/hooks/use-cart";
import notify from "@/lib/toast";

export default function CartPage() {
  const { data: user, isLoading: isAuthLoading } = useCurrentUser();
  const { data: cart, isLoading: isCartLoading } = useCart();
  const updateCartMutation = useUpdateCartItem();
  const removeCartMutation = useRemoveCartItem();

  const handleQuantityChange = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      await updateCartMutation.mutateAsync({ itemId, quantity: newQty });
    } catch (err) {
      notify.apiError(err, "Failed to update item quantity");
    }
  };

  const handleRemove = async (itemId: string, productName: string) => {
    try {
      await removeCartMutation.mutateAsync(itemId);
      notify.success("Removed from cart", productName);
    } catch (err) {
      notify.apiError(err, "Failed to remove item");
    }
  };

  const items = cart?.productItems ?? [];
  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0,
  );

  if (isAuthLoading || (user && isCartLoading)) {
    return (
      <div className="py-8 sm:py-12">
        <Container className="space-y-6">
          <Skeleton className="h-6 w-40" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-10">
      <Container className="space-y-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground"
        >
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="size-3.5 opacity-50" />
          <span className="font-semibold text-foreground">Shopping Cart</span>
        </nav>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-7 w-3 rounded-xs bg-primary inline-block" />
            <span className="text-xs sm:text-sm font-semibold text-primary tracking-wide">
              Cart
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Your Cart
          </h1>
        </div>

        {!user ? (
          <EmptyState
            icon={<ShoppingBag className="size-8" />}
            title="Please sign in to view your cart"
            description="Your cart is tied to your buyer account. Sign in to access your saved items."
            actionLabel="Sign In"
            actionHref="/login"
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="size-8" />}
            title="Your Cart Is Empty"
            description="You haven't added any products to your cart yet. Discover our latest arrivals and explore authentic products!"
            actionLabel="Explore Products"
            actionHref="/products"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Items Table */}
            <div className="lg:col-span-8 space-y-4">
              <div className="rounded-lg border border-border bg-card overflow-hidden divide-y divide-border/60">
                {items.map((item) => {
                  const product = item.product;
                  const itemTotal = (product?.price || 0) * item.quantity;
                  const imageUrl = product?.featureImage?.url;

                  return (
                    <div
                      key={item._id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      {/* Product Preview */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative size-16 sm:size-20 rounded-md bg-[#F5F5F5] dark:bg-neutral-900 border border-border/80 overflow-hidden shrink-0 flex items-center justify-center">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              fill
                              unoptimized
                              className="object-contain p-1"
                            />
                          ) : (
                            <ShoppingBag className="size-6 text-muted-foreground opacity-40" />
                          )}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <Link
                            href={`/products/${product._id}`}
                            className="text-sm sm:text-base font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                          >
                            {product.name}
                          </Link>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>Unit: ${product.price.toFixed(2)}</span>
                            {item.size && (
                              <span className="rounded-xs bg-muted px-1.5 py-0.5 font-semibold text-foreground">
                                Size: {item.size}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity & Item Total Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        <div className="flex items-center rounded-md border border-border bg-background overflow-hidden">
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(item._id, item.quantity - 1)
                            }
                            disabled={
                              item.quantity <= 1 || updateCartMutation.isPending
                            }
                            className="flex size-8 items-center justify-center text-foreground hover:bg-muted disabled:opacity-40 cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(item._id, item.quantity + 1)
                            }
                            disabled={updateCartMutation.isPending}
                            className="flex size-8 items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>

                        <span className="text-sm sm:text-base font-bold text-primary font-mono min-w-[70px] text-right">
                          ${itemTotal.toFixed(2)}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemove(item._id, product.name)}
                          disabled={removeCartMutation.isPending}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          aria-label={`Remove ${product.name} from cart`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link href="/products">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ArrowLeft className="size-3.5" />
                    <span>Return to Shop</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Summary Sidebar */}
            <div className="lg:col-span-4 rounded-lg border border-border bg-card p-6 space-y-4 shadow-xs">
              <h2 className="text-base font-bold text-foreground">
                Cart Total
              </h2>

              <div className="space-y-3 text-xs sm:text-sm divide-y divide-border/60">
                <div className="flex items-center justify-between pt-2 text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-foreground font-mono">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 text-muted-foreground">
                  <span>Shipping:</span>
                  <span className="font-semibold text-emerald-500">
                    Free
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 text-sm sm:text-base font-bold text-foreground">
                  <span>Total:</span>
                  <span className="text-primary font-mono">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/checkout" className="block w-full">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5">
                    Process to Checkout
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

