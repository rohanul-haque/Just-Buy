"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  User as UserIcon,
  Package,
  Heart,
  ShoppingCart,
  KeyRound,
  LogOut,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useLogout } from "@/features/auth/hooks/use-auth";
import type { User } from "@/features/auth/types";
import notify from "@/lib/toast";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export function MobileNav({
  isOpen,
  onClose,
  user,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}: MobileNavProps) {
  const pathname = usePathname();
  const logoutMutation = useLogout();

  // Close on escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        onClose();
        notify.success("You have been logged out successfully.");
      },
      onError: (err) => {
        notify.apiError(err, "Logout failed. Please try again.");
      },
    });
  };

  const mainLinks = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
    { label: "All Products", href: "/products" },
  ];

  const userLinks = [
    { label: "My Profile", href: "/profile", icon: UserIcon },
    { label: "My Orders", href: "/orders", icon: Package },
    { label: "Wishlist", href: "/wishlist", icon: Heart },
    { label: "Cart", href: "/cart", icon: ShoppingCart },
    { label: "Change Password", href: "/change-password", icon: KeyRound },
  ];

  return (
    <div className="md:hidden border-t border-border bg-background px-4 pt-3 pb-6 shadow-xl max-h-[calc(100vh-4.5rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-150">
      <div className="space-y-4 max-w-md mx-auto w-full">
        {/* Mobile Search Input */}
        <form onSubmit={onSearchSubmit} className="w-full">
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            leadingIcon={<Search className="text-muted-foreground" />}
            className="h-10 w-full bg-muted/40"
          />
        </form>

        {/* User Card if Authenticated */}
        {user ? (
          <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
            <div className="flex items-center gap-3">
              <UserAvatar
                src={user.avatar}
                name={user.name}
                size="md"
                className="border border-border"
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="truncate text-sm font-semibold text-foreground">
                  {user.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Primary Navigation Links */}
        <nav className="flex flex-col space-y-1">
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Menu
          </span>
          {mainLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-base font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-muted",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Authenticated Links Section */}
        {user ? (
          <>
            <Separator />
            <div className="space-y-1">
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Account
              </span>
              {userLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="size-5 text-muted-foreground" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <Separator />

            {/* Logout Button */}
            <div className="pt-1 pb-4">
              <Button
                variant="outline"
                className="w-full justify-center gap-2 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="size-4" />
                    <span>Log Out</span>
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          /* Guest Actions Section */
          <div className="pt-2 space-y-2 border-t border-border">
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account
            </span>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Link href="/login" onClick={onClose} className="w-full">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={onClose} className="w-full">
                <Button className="w-full">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

