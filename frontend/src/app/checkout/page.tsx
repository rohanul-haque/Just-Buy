"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShoppingBag, PackageX, ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { BuyerAuthGuard } from "@/features/buyer/components/buyer-auth-guard";
import { useCart } from "@/features/cart/hooks/use-cart";
import {
  useBuyerProfile,
  useCreateOrder,
} from "@/features/buyer/hooks/use-buyer";
import type { OrderType } from "@/features/buyer/types";
import notify from "@/lib/toast";

const checkoutFormSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  location: z.string().trim().min(1, "Location is required"),
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^[+0-9\s-]{7,20}$/, "Please enter a valid phone number"),
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  saveInfo: z.boolean(),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

const DEFAULT_SHIPPING_CHARGE = 50;

function VisaLogo() {
  return (
    <div className="flex h-6 w-10 items-center justify-center rounded-xs bg-[#00579f] px-1 text-[11px] font-black italic tracking-wider text-white shadow-xs select-none">
      VISA
    </div>
  );
}

function MastercardLogo() {
  return (
    <div className="flex h-6 w-9 items-center justify-center rounded-xs bg-neutral-900 px-1 shadow-xs select-none">
      <div className="relative flex items-center">
        <div className="size-3.5 rounded-full bg-[#EB001B]" />
        <div className="-ml-1.5 size-3.5 rounded-full bg-[#F79E1B] opacity-90" />
      </div>
    </div>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const { data: cart, isLoading: isCartLoading } = useCart();
  const { data: profile, isLoading: isProfileLoading } = useBuyerProfile();
  const createOrderMutation = useCreateOrder();

  const [paymentMethod, setPaymentMethod] = React.useState<OrderType>("ONLINE");

  const items = cart?.productItems ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      firstName: "",
      location: "",
      phoneNumber: "",
      email: "",
      saveInfo: false,
    },
  });

  // Pre-fill form from buyer profile if available
  React.useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.buyer?.name || "",
        location: profile.address || "",
        phoneNumber: profile.phoneNumber || "",
        email: profile.buyer?.email || "",
        saveInfo: false,
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

  const onSubmit = async (values: CheckoutFormValues) => {
    if (items.length === 0) {
      notify.error("Your cart is empty.");
      return;
    }

    try {
      const result = await createOrderMutation.mutateAsync({
        orderType: paymentMethod,
        shippingAddress: {
          fullName: values.firstName.trim(),
          phoneNumber: values.phoneNumber.trim(),
          address: values.location.trim(),
          city: values.location.trim(),
          postalCode: "1200",
          country: "Bangladesh",
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
          notify.success("Order created! Redirecting to orders...");
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
          <Skeleton className="h-48 w-full rounded-md" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="h-72 w-full rounded-md" />
            <Skeleton className="h-72 w-full rounded-md" />
          </div>
        </Container>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-6 sm:pt-8 pb-12 sm:pb-16 bg-white min-h-[calc(100vh-4rem)]">
        <Container className="space-y-5 sm:space-y-6">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs sm:text-sm text-neutral-500"
          >
            <Link href="/" className="hover:text-neutral-900 transition-colors">
              Home
            </Link>
            <span className="text-neutral-400">/</span>
            <Link href="/cart" className="hover:text-neutral-900 transition-colors">
              Cart
            </Link>
            <span className="text-neutral-400">/</span>
            <span className="text-neutral-900 font-medium">Checkout</span>
          </nav>

          <div className="w-full border border-neutral-200 rounded-2xl bg-white py-10 sm:py-14 px-6 sm:px-8 text-center flex flex-col items-center justify-center shadow-xs">
            <div className="size-14 sm:size-16 rounded-full bg-orange-50 text-[#ff6200] flex items-center justify-center mb-4">
              <ShoppingBag className="size-7 sm:size-8 stroke-[1.5]" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
              Your Cart is Empty
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1.5 mb-6 leading-relaxed max-w-sm">
              You don&apos;t have any products in your cart to checkout. Discover our authentic products and add them to your cart!
            </p>
            <Link
              href="/products"
              className="bg-[#ff6200] hover:bg-[#e65800] text-white px-7 py-2.5 rounded-xs text-xs sm:text-sm font-medium transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Move To Shop</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12">
      <Container className="space-y-8 sm:space-y-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-neutral-400 font-normal"
        >
          <Link href="/profile" className="hover:text-neutral-900 transition-colors">
            Account
          </Link>
          <span>/</span>
          <Link href="/profile" className="hover:text-neutral-900 transition-colors">
            My Account
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-neutral-900 transition-colors">
            Product
          </Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-neutral-900 transition-colors">
            View Cart
          </Link>
          <span>/</span>
          <span className="text-neutral-900 font-normal">CheckOut</span>
        </nav>

        {/* Section Heading */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
            Billing Details
          </h1>
        </div>

        {/* Top Items Table with Orange Border */}
        <div className="border border-[#ff6200] rounded-md overflow-hidden bg-white shadow-2xs">
          {/* Table Header */}
          <div className="grid grid-cols-12 text-sm sm:text-base font-normal text-neutral-900 border-b border-[#ff6200]">
            <div className="col-span-6 py-4 px-4 sm:px-6 text-left">
              Product
            </div>
            <div className="col-span-3 py-4 text-center border-l border-r border-[#ff6200]">
              Quantity
            </div>
            <div className="col-span-3 py-4 px-4 sm:px-6 text-center">
              Price
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[#ff6200]">
            {items.map((item) => {
              const product = item.product;
              const imageUrl = product?.featureImage?.url;

              return (
                <div
                  key={item._id}
                  className="grid grid-cols-12 items-center text-sm sm:text-base text-neutral-900"
                >
                  {/* Product Info */}
                  <div className="col-span-6 flex items-center gap-3 sm:gap-4 py-4 px-4 sm:px-6">
                    <div className="relative size-12 sm:size-14 shrink-0 flex items-center justify-center">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product?.name || "Product"}
                          fill
                          unoptimized
                          className="object-contain"
                        />
                      ) : (
                        <PackageX className="size-5 text-neutral-400" />
                      )}
                    </div>
                    <span className="text-xs sm:text-sm md:text-base font-normal text-neutral-900 line-clamp-2">
                      {product?.name || "Product"}
                    </span>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-3 self-stretch flex items-center justify-center border-l border-r border-[#ff6200] py-4 text-center text-xs sm:text-sm md:text-base font-normal">
                    {String(item.quantity).padStart(2, "0")}
                  </div>

                  {/* Unit Price */}
                  <div className="col-span-3 py-4 px-4 sm:px-6 text-center text-xs sm:text-sm md:text-base font-normal">
                    ${product?.price || 0}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form and Summary: 2 Columns */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Left Column: Input Fields */}
            <div className="lg:col-span-6 space-y-6">
              {/* First Name */}
              <div className="space-y-2">
                <label
                  htmlFor="firstName"
                  className="block text-sm text-neutral-400 font-normal"
                >
                  First Name<span className="text-[#ff6200]">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  disabled={isPending}
                  className="w-full h-12 rounded-xs bg-[#F5F5F5] px-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#ff6200] transition-colors"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label
                  htmlFor="location"
                  className="block text-sm text-neutral-400 font-normal"
                >
                  Location<span className="text-[#ff6200]">*</span>
                </label>
                <input
                  id="location"
                  type="text"
                  disabled={isPending}
                  className="w-full h-12 rounded-xs bg-[#F5F5F5] px-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#ff6200] transition-colors"
                  {...register("location")}
                />
                {errors.location && (
                  <p className="text-xs text-red-500">{errors.location.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm text-neutral-400 font-normal"
                >
                  Phone Number<span className="text-[#ff6200]">*</span>
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  disabled={isPending}
                  className="w-full h-12 rounded-xs bg-[#F5F5F5] px-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#ff6200] transition-colors"
                  {...register("phoneNumber")}
                />
                {errors.phoneNumber && (
                  <p className="text-xs text-red-500">{errors.phoneNumber.message}</p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm text-neutral-400 font-normal"
                >
                  Email Address<span className="text-[#ff6200]">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  disabled={isPending}
                  className="w-full h-12 rounded-xs bg-[#F5F5F5] px-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#ff6200] transition-colors"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Save Information Checkbox */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  id="saveInfo"
                  type="checkbox"
                  disabled={isPending}
                  className="size-4 rounded-xs accent-[#ff6200] cursor-pointer"
                  {...register("saveInfo")}
                />
                <label
                  htmlFor="saveInfo"
                  className="text-xs sm:text-sm text-neutral-800 cursor-pointer select-none"
                >
                  Save this information for faster check-out next time
                </label>
              </div>
            </div>

            {/* Right Column: Order Summary & Payment */}
            <div className="lg:col-span-6 space-y-5 lg:pl-6">
              {/* Product list with images & totals */}
              <div className="space-y-4">
                {items.map((item) => {
                  const product = item.product;
                  const itemTotal = (product?.price || 0) * item.quantity;
                  const imageUrl = product?.featureImage?.url;

                  return (
                    <div
                      key={item._id}
                      className="flex items-center justify-between gap-4 text-sm sm:text-base"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="relative size-12 shrink-0 flex items-center justify-center">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={product?.name || "Product"}
                              fill
                              unoptimized
                              className="object-contain"
                            />
                          ) : (
                            <PackageX className="size-4 text-neutral-400" />
                          )}
                        </div>
                        <span className="text-neutral-800 truncate font-normal">
                          {product?.name || "Product"}
                        </span>
                      </div>
                      <span className="text-neutral-800 font-normal shrink-0">
                        ${itemTotal}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Subtotal, Shipping, Total */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-sm sm:text-base py-3 border-b border-neutral-300">
                  <span className="text-neutral-800 font-normal">Subtotal:</span>
                  <span className="text-neutral-800 font-normal">${subtotal}</span>
                </div>

                <div className="flex items-center justify-between text-sm sm:text-base py-3 border-b border-neutral-300">
                  <span className="text-neutral-800 font-normal">Shipping:</span>
                  <span className="text-neutral-800 font-normal">
                    {shippingCharge === 0 ? "Free" : `$${shippingCharge}`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm sm:text-base py-3">
                  <span className="text-neutral-800 font-normal">Total:</span>
                  <span className="text-neutral-800 font-medium">${totalAmount}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3 pt-1">
                {/* Stripe */}
                <label
                  onClick={() => setPaymentMethod("ONLINE")}
                  className="flex items-center justify-between cursor-pointer py-1.5"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="method-online"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={paymentMethod === "ONLINE"}
                      onChange={() => setPaymentMethod("ONLINE")}
                      className="size-4.5 accent-black cursor-pointer"
                    />
                    <span className="text-sm sm:text-base text-neutral-800 font-normal">
                      Stripe
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <VisaLogo />
                    <MastercardLogo />
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label
                  onClick={() => setPaymentMethod("COD")}
                  className="flex items-center gap-3 cursor-pointer py-1.5"
                >
                  <input
                    type="radio"
                    id="method-cod"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="size-4.5 accent-black cursor-pointer"
                  />
                  <span className="text-sm sm:text-base text-neutral-800 font-normal">
                    Cash on delivery
                  </span>
                </label>
              </div>

              {/* Place Order Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isPending || items.length === 0}
                  className="w-full sm:w-48 h-12 bg-[#ff6200] hover:bg-[#e65800] text-white font-medium rounded-xs text-sm sm:text-base transition-colors shadow-none"
                >
                  {isPending ? "Processing..." : "Place Order"}
                </Button>
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
