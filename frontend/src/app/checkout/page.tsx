"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronRight,
  Truck,
  CreditCard,
  ShoppingBag,
  ShieldCheck,
  PackageX,
  ArrowLeft,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { BuyerAuthGuard } from "@/features/buyer/components/buyer-auth-guard";
import { useCart } from "@/features/cart/hooks/use-cart";
import {
  useBuyerProfile,
  useCreateOrder,
} from "@/features/buyer/hooks/use-buyer";
import type { OrderType } from "@/features/buyer/types";
import notify from "@/lib/toast";

const shippingFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name cannot exceed 100 characters"),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[+0-9\s-]{7,20}$/, "Please enter a valid phone number (7-20 digits)"),
  address: z
    .string()
    .trim()
    .min(1, "Street address is required")
    .max(300, "Address cannot exceed 300 characters"),
  city: z
    .string()
    .trim()
    .min(1, "City is required")
    .max(100, "City cannot exceed 100 characters"),
  postalCode: z
    .string()
    .trim()
    .min(1, "Postal code is required")
    .max(20, "Postal code cannot exceed 20 characters"),
  country: z.string().trim(),
});

type ShippingFormValues = z.infer<typeof shippingFormSchema>;

const DEFAULT_SHIPPING_CHARGE = 50;

function CheckoutContent() {
  const router = useRouter();
  const { data: cart, isLoading: isCartLoading } = useCart();
  const { data: profile, isLoading: isProfileLoading } = useBuyerProfile();
  const createOrderMutation = useCreateOrder();

  const [paymentMethod, setPaymentMethod] = React.useState<OrderType>("COD");

  const items = cart?.productItems ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      address: "",
      city: "",
      postalCode: "",
      country: "Bangladesh",
    },
  });

  // Pre-fill form from buyer profile if available
  React.useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.buyer?.name || "",
        phoneNumber: profile.phoneNumber || "",
        address: profile.address || "",
        city: "",
        postalCode: "",
        country: "Bangladesh",
      });
    }
  }, [profile, reset]);

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0,
  );
  const shippingCharge = items.length > 0 ? DEFAULT_SHIPPING_CHARGE : 0;
  const totalAmount = subtotal + shippingCharge;

  const isPending = isSubmitting || createOrderMutation.isPending;

  const onSubmit = async (values: ShippingFormValues) => {
    if (items.length === 0) {
      notify.error("Your cart is empty.");
      return;
    }

    try {
      const result = await createOrderMutation.mutateAsync({
        orderType: paymentMethod,
        shippingAddress: {
          fullName: values.fullName.trim(),
          phoneNumber: values.phoneNumber.trim(),
          address: values.address.trim(),
          city: values.city.trim(),
          postalCode: values.postalCode.trim(),
          country: values.country.trim() || "Bangladesh",
        },
      });

      if (paymentMethod === "COD") {
        notify.success(
          "Order placed successfully!",
          `Order #${result.order._id.slice(-6).toUpperCase()}`,
        );
        router.push(`/orders/${result.order._id}`);
      } else if (paymentMethod === "ONLINE") {
        if (result.checkoutUrl) {
          notify.info("Redirecting to secure Stripe Checkout...");
          window.location.assign(result.checkoutUrl);
        } else {
          notify.success("Order created! View your order to proceed.");
          router.push(`/orders/${result.order._id}`);
        }
      }
    } catch (err: unknown) {
      notify.apiError(err, "Failed to place order. Please review your details.");
    }
  };

  if (isCartLoading || isProfileLoading) {
    return (
      <div className="py-8 sm:py-12">
        <Container className="space-y-6">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
            <div className="lg:col-span-5 space-y-4">
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-8 sm:py-12">
        <Container className="space-y-6">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground"
          >
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="size-3.5 opacity-50" />
            <Link href="/cart" className="hover:text-primary transition-colors">
              Cart
            </Link>
            <ChevronRight className="size-3.5 opacity-50" />
            <span className="font-semibold text-foreground">Checkout</span>
          </nav>

          <EmptyState
            icon={<ShoppingBag className="size-8" />}
            title="Your Cart Is Empty"
            description="You don't have any products in your cart to checkout. Discover our authentic products!"
            actionLabel="Explore Products"
            actionHref="/products"
          />
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
          <Link href="/cart" className="hover:text-primary transition-colors">
            Cart
          </Link>
          <ChevronRight className="size-3.5 opacity-50" />
          <span className="font-semibold text-foreground">Checkout</span>
        </nav>

        {/* Section Heading */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-7 w-3 rounded-xs bg-primary inline-block" />
            <span className="text-xs sm:text-sm font-semibold text-primary tracking-wide">
              Complete Order
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Checkout
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Shipping Address & Payment Method */}
            <div className="lg:col-span-7 space-y-8">
              {/* Shipping Address Card */}
              <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                  <Truck className="size-5 text-primary" />
                  <h2 className="text-base sm:text-lg font-bold text-foreground">
                    1. Shipping Information
                  </h2>
                </div>

                <div className="space-y-4 text-sm">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-xs font-semibold">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="e.g. Cameron Williamson"
                      disabled={isPending}
                      hasError={Boolean(errors.fullName)}
                      {...register("fullName")}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-destructive">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <Label htmlFor="phoneNumber" className="text-xs font-semibold">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="e.g. +8801700000000"
                      disabled={isPending}
                      hasError={Boolean(errors.phoneNumber)}
                      {...register("phoneNumber")}
                    />
                    {errors.phoneNumber && (
                      <p className="text-xs text-destructive">
                        {errors.phoneNumber.message}
                      </p>
                    )}
                  </div>

                  {/* Street Address */}
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-xs font-semibold">
                      Street Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="address"
                      placeholder="House, Road, Apartment, Area..."
                      disabled={isPending}
                      hasError={Boolean(errors.address)}
                      {...register("address")}
                    />
                    {errors.address && (
                      <p className="text-xs text-destructive">
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  {/* City & Postal Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-xs font-semibold">
                        City / District <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="city"
                        placeholder="e.g. Dhaka"
                        disabled={isPending}
                        hasError={Boolean(errors.city)}
                        {...register("city")}
                      />
                      {errors.city && (
                        <p className="text-xs text-destructive">
                          {errors.city.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="postalCode" className="text-xs font-semibold">
                        Postal Code <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="postalCode"
                        placeholder="e.g. 1200"
                        disabled={isPending}
                        hasError={Boolean(errors.postalCode)}
                        {...register("postalCode")}
                      />
                      {errors.postalCode && (
                        <p className="text-xs text-destructive">
                          {errors.postalCode.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Country */}
                  <div className="space-y-1.5">
                    <Label htmlFor="country" className="text-xs font-semibold">
                      Country
                    </Label>
                    <Input
                      id="country"
                      disabled
                      defaultValue="Bangladesh"
                      className="bg-muted/30 cursor-not-allowed"
                      {...register("country")}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selection Card */}
              <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                  <CreditCard className="size-5 text-primary" />
                  <h2 className="text-base sm:text-lg font-bold text-foreground">
                    2. Payment Method
                  </h2>
                </div>

                <div className="space-y-3" role="radiogroup" aria-label="Payment Method Selection">
                  {/* Option 1: Cash on Delivery (COD) */}
                  <div
                    onClick={() => setPaymentMethod("COD")}
                    className={`cursor-pointer rounded-xl border p-4 transition-all flex items-start gap-4 ${
                      paymentMethod === "COD"
                        ? "border-primary bg-primary/5 ring-1 ring-primary shadow-2xs"
                        : "border-border hover:border-primary/50 bg-background"
                    }`}
                  >
                    <input
                      type="radio"
                      id="method-cod"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="mt-1 size-4 accent-primary cursor-pointer"
                    />
                    <label htmlFor="method-cod" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Truck className="size-4 text-primary" />
                        <span className="font-semibold text-foreground text-sm sm:text-base">
                          Cash on Delivery
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Pay when your order is delivered to your doorstep.
                      </p>
                    </label>
                  </div>

                  {/* Option 2: Online Payment (Stripe) */}
                  <div
                    onClick={() => setPaymentMethod("ONLINE")}
                    className={`cursor-pointer rounded-xl border p-4 transition-all flex items-start gap-4 ${
                      paymentMethod === "ONLINE"
                        ? "border-primary bg-primary/5 ring-1 ring-primary shadow-2xs"
                        : "border-border hover:border-primary/50 bg-background"
                    }`}
                  >
                    <input
                      type="radio"
                      id="method-stripe"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={paymentMethod === "ONLINE"}
                      onChange={() => setPaymentMethod("ONLINE")}
                      className="mt-1 size-4 accent-primary cursor-pointer"
                    />
                    <label htmlFor="method-stripe" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="size-4 text-primary" />
                          <span className="font-semibold text-foreground text-sm sm:text-base">
                            Online Payment (Stripe)
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Secure
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Pay securely using Credit / Debit Card via Stripe Checkout.
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              {/* Return to cart button */}
              <div>
                <Link href="/cart">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ArrowLeft className="size-3.5" />
                    <span>Return to Cart</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-5 shadow-xs sticky top-20">
                <h2 className="text-base sm:text-lg font-bold text-foreground border-b border-border/60 pb-3">
                  Order Summary ({items.length} {items.length === 1 ? "Item" : "Items"})
                </h2>

                {/* Items List */}
                <div className="max-h-80 overflow-y-auto space-y-3 divide-y divide-border/50 pr-1">
                  {items.map((item) => {
                    const product = item.product;
                    const itemTotal = (product?.price || 0) * item.quantity;
                    const imageUrl = product?.featureImage?.url;

                    return (
                      <div
                        key={item._id}
                        className="flex items-center justify-between gap-3 pt-3 first:pt-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 rounded-md bg-muted/30 border border-border overflow-hidden shrink-0 flex items-center justify-center">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={product?.name || "Product"}
                                fill
                                unoptimized
                                className="object-contain p-0.5"
                              />
                            ) : (
                              <PackageX className="size-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground line-clamp-1">
                              {product?.name || "Product"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Qty: {item.quantity} × ${product?.price?.toFixed(2) || "0.00"}
                            </p>
                          </div>
                        </div>

                        <span className="font-semibold text-xs text-foreground font-mono">
                          ${itemTotal.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Totals Breakdown */}
                <div className="space-y-2.5 text-xs sm:text-sm border-t border-border/60 pt-4 divide-y divide-border/40">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-foreground font-mono">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-muted-foreground">
                    <span>Standard Delivery:</span>
                    <span className="font-semibold text-foreground font-mono">
                      ${shippingCharge.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 text-base sm:text-lg font-bold text-foreground">
                    <span>Total Amount:</span>
                    <span className="text-primary font-mono font-bold">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Checkout Submission Button */}
                <div className="pt-2 space-y-2">
                  <Button
                    type="submit"
                    disabled={isPending || items.length === 0}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl text-sm sm:text-base shadow-sm"
                  >
                    {isPending ? (
                      <span className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        <span>Processing...</span>
                      </span>
                    ) : paymentMethod === "COD" ? (
                      "Place Order (Cash on Delivery)"
                    ) : (
                      "Continue to Payment (Stripe)"
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                    <ShieldCheck className="size-3.5 text-emerald-500" />
                    <span>Safe & encrypted checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Container>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <BuyerAuthGuard>
      <CheckoutContent />
    </BuyerAuthGuard>
  );
}
