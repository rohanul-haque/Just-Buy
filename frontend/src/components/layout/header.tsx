"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, Menu, X } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserDropdown } from "@/components/layout/user-dropdown";
import { useCurrentUser } from "@/features/auth/hooks/use-auth";
import { useCart } from "@/features/cart/hooks/use-cart";
import { useWishlist } from "@/features/wishlist/hooks/use-wishlist";
import { useIsMounted } from "@/hooks/use-is-mounted";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const isMounted = useIsMounted();

  const { data: user, isLoading } = useCurrentUser();
  const { data: cart } = useCart();
  const { data: wishlist } = useWishlist();

  const cartCount =
    user && cart?.productItems
      ? cart.productItems.reduce((acc, item) => acc + (item.quantity || 1), 0)
      : 0;

  const wishlistCount =
    user && wishlist?.products ? wishlist.products.length : 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/90">
      <Container className="flex h-16 sm:h-20 items-center justify-between gap-4">
        {/* Brand Logo (Left) */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.svg"
            alt="JusBuy Logo"
            width={130}
            height={40}
            className="h-8 sm:h-9 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation (Center: Home, Contact, About) */}
        <DesktopNav />

        {/* User Actions & Profile (Right) */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Wishlist Link (Heart Icon) */}
          <Link href="/wishlist">
            <button
              type="button"
              className="text-gray-800 hover:text-[#fe6201] transition-colors relative p-1.5 focus:outline-none cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart className="size-5 sm:size-6 stroke-[1.8]" />
              {isMounted && wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[#fe6201] text-[10px] font-bold text-white shadow-2xs">
                  {wishlistCount}
                </span>
              )}
            </button>
          </Link>

          {/* Cart Link (Shopping Cart Icon with Orange Badge) */}
          <Link href="/cart">
            <button
              type="button"
              className="text-gray-800 hover:text-[#fe6201] transition-colors relative p-1.5 focus:outline-none cursor-pointer"
              aria-label="Cart"
            >
              <ShoppingCart className="size-5 sm:size-6 stroke-[1.8]" />
              {isMounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 sm:size-4.5 items-center justify-center rounded-full bg-[#fe6201] text-[10px] font-bold text-white shadow-2xs">
                  {cartCount}
                </span>
              )}
            </button>
          </Link>

          {/* Dynamic Authentication State: User Avatar or Login Button */}
          {!isMounted || isLoading ? (
            <div
              className="size-9 sm:size-10 rounded-full bg-gray-200 animate-pulse shrink-0"
              aria-hidden="true"
            />
          ) : user ? (
            <div className="flex items-center">
              <UserDropdown user={user} />
            </div>
          ) : (
            <div className="flex items-center">
              <Link href="/login">
                <Button className="rounded-full bg-[#fe6201] hover:bg-[#e05500] text-white text-xs sm:text-sm font-semibold px-5 sm:px-6 h-9 sm:h-10 shadow-xs cursor-pointer transition-all">
                  Login
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden size-9 text-gray-800 hover:text-black hover:bg-gray-100 cursor-pointer"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>
        </div>
      </Container>

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={isMounted ? user : null}
      />
    </header>
  );
}

export default Header;
