"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User as UserIcon,
  Package,
  Heart,
  ShoppingCart,
  KeyRound,
  LogOut,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLogout } from "@/features/auth/hooks/use-auth";
import type { User } from "@/features/auth/types";
import notify from "@/lib/toast";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
}

export function MobileNav({ isOpen, onClose, user }: MobileNavProps) {
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
    { label: "All Products", href: "/products" },
    { label: "Contact", href: "/contact" },
    { label: "About", href: "/about" },
  ];

  const userLinks = [
    { label: "My Profile", href: "/profile", icon: UserIcon },
    { label: "My Orders", href: "/orders", icon: Package },
    { label: "Wishlist", href: "/wishlist", icon: Heart },
    { label: "Cart", href: "/cart", icon: ShoppingCart },
    { label: "Change Password", href: "/change-password", icon: KeyRound },
  ];

  const avatarUrl = user?.avatar || (user as any)?.profile?.url || null;

  return (
    <div className="md:hidden border-t border-gray-200/80 bg-white px-4 pt-3 pb-6 shadow-xl max-h-[calc(100vh-4.5rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-150">
      <div className="space-y-4 max-w-md mx-auto w-full">
        {/* User Card if Authenticated */}
        {user ? (
          <div className="rounded-2xl border border-gray-100 bg-orange-50/40 p-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user.name || "User"}
                    className="size-full object-cover rounded-full"
                  />
                ) : (
                  <div className="size-full bg-[#fe6201] flex items-center justify-center text-white rounded-full">
                    <UserIcon className="size-5 text-white" />
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="truncate text-sm font-semibold text-gray-900">
                  {user.name}
                </span>
                <span className="truncate text-xs text-gray-500">
                  {user.email}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Primary Navigation Links */}
        <nav className="flex flex-col space-y-1">
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
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
                  "flex items-center rounded-xl px-3 py-2.5 text-base font-medium transition-colors",
                  isActive
                    ? "bg-orange-50 text-[#fe6201] font-semibold"
                    : "text-gray-800 hover:bg-gray-50 hover:text-black",
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
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
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
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-orange-50 text-[#fe6201] font-semibold"
                        : "text-gray-700 hover:bg-gray-50 hover:text-[#fe6201]",
                    )}
                  >
                    <Icon className="size-4.5 text-gray-500" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <Separator />

            {/* Logout Button */}
            <div className="pt-1 pb-2">
              <Button
                variant="outline"
                className="w-full justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-xl cursor-pointer"
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
          <div className="pt-2 space-y-3 border-t border-gray-100">
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Account
            </span>
            <div className="flex flex-col gap-2 pt-1">
              <Link href="/login" onClick={onClose} className="w-full">
                <Button className="w-full rounded-full bg-[#fe6201] hover:bg-[#e05500] text-white font-semibold h-10 shadow-xs cursor-pointer">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MobileNav;
