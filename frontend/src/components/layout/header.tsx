"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* Top micro-bar */}
      <div className="bg-muted/50 border-b border-border/50 py-1 text-xs text-muted-foreground text-center hidden sm:block">
        <Container>
          <span>Free delivery on orders over $50 | 100% Authentic Products</span>
        </Container>
      </div>

      <Container className="flex h-16 items-center justify-between gap-4">
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

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/"
            className="text-foreground transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link
            href="/categories"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            Categories
          </Link>
          <Link
            href="/products"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            All Products
          </Link>
        </nav>

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
            </Button>
          </Link>

          {/* Auth / Account Link */}
          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex gap-1.5"
            >
              <User className="size-4" />
              <span>Sign In</span>
            </Button>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
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
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 pt-2 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="pt-2">
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leadingIcon={<Search className="text-muted-foreground" />}
              className="h-10 w-full"
            />
          </form>

          <nav className="flex flex-col space-y-2 text-base font-medium">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-foreground hover:text-primary"
            >
              Home
            </Link>
            <Link
              href="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-muted-foreground hover:text-primary"
            >
              Categories
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-muted-foreground hover:text-primary"
            >
              All Products
            </Link>
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-muted-foreground hover:text-primary"
            >
              My Orders
            </Link>
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-muted-foreground hover:text-primary"
            >
              My Profile
            </Link>
            <div className="pt-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">Sign In / Register</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

