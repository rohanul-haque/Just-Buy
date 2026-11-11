import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/container";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 text-muted-foreground mt-auto">
      <Container className="py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.svg"
                alt="JustBuy Logo"
                width={120}
                height={36}
                className="h-8 w-auto dark:invert"
              />
            </Link>
            <p className="text-sm leading-relaxed">
              Your premier multi-vendor marketplace. Buy anything you want from
              anywhere at your fingertips.
            </p>
          </div>

          {/* Shop Categories Col */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Shop Categories
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-primary transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?sort=newest" className="hover:text-primary transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-primary transition-colors">
                  Browse Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support Col */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Customer Support
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/orders" className="hover:text-primary transition-colors">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-primary transition-colors">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-primary transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-primary transition-colors">
                  My Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Guarantee & Secure Shopping */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Security & Guarantee
            </h4>
            <p className="text-sm leading-relaxed">
              100% verified vendors, end-to-end buyer protection, and secure payment processing.
            </p>
            <div className="pt-2 text-xs text-muted-foreground/80">
              Need assistance? Email us at support@jusbuy.com
            </div>
          </div>
        </div>

        <div className="border-t border-border/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} JustBuy Storefront. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}

