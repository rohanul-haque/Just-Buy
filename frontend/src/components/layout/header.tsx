"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, Heart, Menu, X } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserDropdown } from "@/components/layout/user-dropdown";
import { useCurrentUser } from "@/features/auth/hooks/use-auth";
import { useCart } from "@/features/cart/hooks/use-cart";
import { useWishlist } from "@/features/wishlist/hooks/use-wishlist";
import { useIsMounted } from "@/hooks/use-is-mounted";

export function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      {/* Top micro-bar */}
      <div className="bg-muted/50 border-b border-border/50 py-1 text-xs text-muted-foreground text-center hidden sm:block">
        <Container>
          <span>Free delivery on orders over $50 | 100% Authentic Products</span>
        </Container>
      </div>

      <Container className="flex h-16 items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.svg"
            alt="JustBuy Logo"
            width={120}
            height={36}
            className="h-8 w-auto dark:invert"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <DesktopNav />

        {/* Global Search Bar (Desktop) */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden lg:flex items-center flex-1 max-w-md mx-4"
        >
          <Input
            type="search"
            placeholder="Search products, brands, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leadingIcon={<Search className="text-muted-foreground" />}
            className="h-9 w-full bg-muted/30"
          />
        </form>

        {/* User Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Wishlist Link */}
          <Link href="/wishlist">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground relative"
              aria-label="Wishlist"
            >
              <Heart className="size-5" />
              {isMounted && wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-2xs">
                  {wishlistCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Cart Link */}
          <Link href="/cart">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground relative"
              aria-label="Cart"
            >
              <ShoppingCart className="size-5" />
              {isMounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-2xs">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Dynamic Authentication State Area */}
          {!isMounted || isLoading ? (
            <div
              className="h-9 w-20 rounded-md bg-muted/40 animate-pulse hidden sm:block"
              aria-hidden="true"
            />
          ) : user ? (
            <div className="hidden sm:block">
              <UserDropdown user={user} />
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-medium">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="font-medium">
                  Register
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
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
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />
    </header>
  );
}
