"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ChevronUp, ChevronDown, ShoppingBag, ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useCurrentUser } from "@/features/auth/hooks/use-auth";
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
} from "@/features/cart/hooks/use-cart";
import { cn } from "@/lib/utils";
import notify from "@/lib/toast";

export default function CartPage() {
  const { data: user, isLoading: isAuthLoading } = useCurrentUser();
  const { data: cart, isLoading: isCartLoading } = useCart();
  const updateCartMutation = useUpdateCartItem();
  const removeCartMutation = useRemoveCartItem();

  const handleQuantityChange = async (
    itemId: string,
    newQty: number,
    maxStock?: number,
  ) => {
    if (newQty < 1) return;
    if (maxStock !== undefined && newQty > maxStock) {
      notify.warning(
        `Cannot select more than available stock (${maxStock} items available)`,
      );
      return;
    }
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
  // Shipping fee is 50 as specified by user
  const shippingFee = items.length > 0 ? 50 : 0;
  const total = subtotal + shippingFee;

  if (isAuthLoading || (user && isCartLoading)) {
    return (
      <div className="pt-6 sm:pt-8 pb-12 sm:pb-16 bg-white min-h-[60vh]">
        <Container className="space-y-5 sm:space-y-6">
          <Skeleton className="h-4 w-28" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-md" />
            ))}
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="pt-6 sm:pt-8 pb-16 sm:pb-24 bg-white min-h-[calc(100vh-5rem)]">
      <Container className="space-y-5 sm:space-y-6">
        {/* 1. Breadcrumb matching Mockup */}
        <nav
          aria-label="Breadcrumb"
          className="text-xs sm:text-sm text-neutral-500 flex items-center gap-1.5"
        >
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span className="text-neutral-400">/</span>
          <span className="text-black font-medium">Cart</span>
        </nav>

        {!user ? (
          <div className="w-full border border-neutral-200 rounded-2xl bg-white py-10 sm:py-14 px-6 sm:px-8 text-center flex flex-col items-center justify-center shadow-xs">
            <div className="size-14 sm:size-16 rounded-full bg-orange-50 text-[#ff6200] flex items-center justify-center mb-4">
              <ShoppingBag className="size-7 sm:size-8 stroke-[1.5]" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
              Please Sign In to View Your Cart
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1.5 mb-6 leading-relaxed max-w-sm">
              Your cart is tied to your buyer account. Sign in to access your saved items and continue shopping.
            </p>
            <Link
              href="/login"
              className="bg-[#ff6200] hover:bg-[#e65800] text-white px-7 py-2.5 rounded-xs text-xs sm:text-sm font-medium transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Sign In</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="w-full border border-neutral-200 rounded-2xl bg-white py-10 sm:py-14 px-6 sm:px-8 text-center flex flex-col items-center justify-center shadow-xs">
            <div className="size-14 sm:size-16 rounded-full bg-orange-50 text-[#ff6200] flex items-center justify-center mb-4">
              <ShoppingBag className="size-7 sm:size-8 stroke-[1.5]" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
              Your Cart is Empty
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1.5 mb-6 leading-relaxed max-w-sm">
              You haven&apos;t added any products to your cart yet. Explore our products and add your favorite items!
            </p>
            <Link
              href="/products"
              className="bg-[#ff6200] hover:bg-[#e65800] text-white px-7 py-2.5 rounded-xs text-xs sm:text-sm font-medium transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Move To Shop</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {/* 2. Table Header Box matching Mockup */}
            <div className="grid grid-cols-12 items-center px-6 sm:px-10 py-5 bg-white rounded-md shadow-2xs border border-neutral-100 text-sm font-semibold text-neutral-900">
              <div className="col-span-5 sm:col-span-4 text-left">Product</div>
              <div className="col-span-3 text-center">Price</div>
              <div className="col-span-2 sm:col-span-3 text-center">Quantity</div>
              <div className="col-span-2 text-right">Subtotal</div>
            </div>

            {/* 3. Cart Item Rows matching Mockup */}
            <div className="space-y-5">
              {items.map((item) => {
                const product = item.product;
                const itemTotal = (product?.price || 0) * item.quantity;
                const imageUrl = product?.featureImage?.url;
                const availableStock =
                  product?.stock !== undefined ? product.stock : 999;
                const isMaxStockReached = item.quantity >= availableStock;

                return (
                  <div
                    key={item._id}
                    className="grid grid-cols-12 items-center px-6 sm:px-10 py-5 bg-white rounded-md shadow-2xs border border-neutral-100 transition-all hover:shadow-xs"
                  >
                    {/* Product Column with orange 'x' button on top-left of image */}
                    <div className="col-span-5 sm:col-span-4 flex items-center gap-3 sm:gap-4 min-w-0 pr-2">
                      <div className="relative size-12 sm:size-14 shrink-0 flex items-center justify-center">
                        {/* Red/orange 'x' remove button on top-left of image */}
                        <button
                          type="button"
                          onClick={() =>
                            handleRemove(item._id, product?.name || "Product")
                          }
                          disabled={removeCartMutation.isPending}
                          className="absolute -top-1.5 -left-1.5 z-10 size-4 sm:size-4.5 rounded-full bg-[#ff6200] hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                          title="Remove item"
                        >
                          <X className="size-2.5 sm:size-3 stroke-[3]" />
                        </button>

                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={product?.name || "Product"}
                            fill
                            unoptimized
                            className="object-contain"
                          />
                        ) : (
                          <ShoppingBag className="size-6 text-neutral-400" />
                        )}
                      </div>

                      <Link
                        href={`/products/${product?._id}`}
                        className="text-xs sm:text-sm md:text-base font-semibold text-neutral-900 hover:text-[#ff6200] transition-colors truncate"
                        title={product?.name}
                      >
                        {product?.name}
                      </Link>
                    </div>

                    {/* Price Column */}
                    <div className="col-span-3 text-center text-xs sm:text-sm md:text-base font-semibold text-neutral-800">
                      ${product?.price}
                    </div>

                    {/* Quantity Column: [ 01 ⬍ ] */}
                    <div className="col-span-2 sm:col-span-3 flex justify-center">
                      <div className="inline-flex items-center justify-between border border-neutral-300 rounded-md px-2.5 sm:px-3 py-1.5 w-16 sm:w-20 h-10 bg-white">
                        <span className="text-xs sm:text-sm font-semibold text-neutral-900">
                          {String(item.quantity).padStart(2, "0")}
                        </span>
                        <div className="flex flex-col items-center ml-1 sm:ml-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                item._id,
                                item.quantity + 1,
                                availableStock,
                              )
                            }
                            disabled={
                              isMaxStockReached ||
                              updateCartMutation.isPending
                            }
                            className={cn(
                              "p-0.5 leading-none transition-colors",
                              isMaxStockReached
                                ? "text-neutral-300 cursor-not-allowed opacity-40"
                                : "text-neutral-500 hover:text-[#ff6200] cursor-pointer",
                            )}
                            aria-label="Increase quantity"
                            title={
                              isMaxStockReached
                                ? `Maximum available stock reached (${availableStock})`
                                : "Increase quantity"
                            }
                          >
                            <ChevronUp className="size-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                item._id,
                                item.quantity - 1,
                                availableStock,
                              )
                            }
                            disabled={
                              item.quantity <= 1 ||
                              updateCartMutation.isPending
                            }
                            className="text-neutral-500 hover:text-[#ff6200] disabled:opacity-30 transition-colors p-0.5 cursor-pointer leading-none"
                            aria-label="Decrease quantity"
                          >
                            <ChevronDown className="size-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Subtotal Column */}
                    <div className="col-span-2 text-right text-xs sm:text-sm md:text-base font-bold text-neutral-900">
                      ${itemTotal}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 4. Action Buttons below cart items */}
            <div className="flex items-center justify-between pt-4 pb-10 flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center bg-[#ff6200] hover:bg-[#e65800] text-white font-semibold px-8 sm:px-12 py-3 rounded-md text-sm transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                Return To Shop
              </Link>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center bg-[#ff6200] hover:bg-[#e65800] text-white font-semibold px-8 sm:px-12 py-3 rounded-md text-sm transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                Update Cart
              </button>
            </div>

            {/* 5. Cart Total Card: Full Width as requested */}
            <div className="border border-neutral-900 rounded-sm p-6 sm:p-8 w-full bg-white space-y-6">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                Cart Total
              </h2>

              <div className="space-y-4 text-sm divide-y divide-neutral-200">
                <div className="flex items-center justify-between pb-3 text-neutral-800">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-neutral-900">
                    ${subtotal}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 text-neutral-800">
                  <span>Shipping:</span>
                  <span className="font-semibold text-neutral-900">
                    ${shippingFee}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 text-base font-bold text-neutral-900">
                  <span>Total:</span>
                  <span>${total}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-center">
                <Link
                  href="/checkout"
                  className="w-full inline-flex items-center justify-center bg-[#ff6200] hover:bg-[#e65800] text-white font-semibold py-3.5 px-8 rounded-md text-sm sm:text-base transition-all shadow-xs active:scale-95 cursor-pointer text-center"
                >
                  Proceed to checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
