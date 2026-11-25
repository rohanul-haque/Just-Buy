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
  ChevronRight,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useLogout } from "@/features/auth/hooks/use-auth";
import type { User } from "@/features/auth/types";
import { cn } from "@/lib/utils";
import notify from "@/lib/toast";

interface UserDropdownProps {
  user: User;
}

export function UserDropdown({ user }: UserDropdownProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const logoutMutation = useLogout();
  const avatarUrl = user.avatar || (user as any)?.profile?.url || null;

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard events (Escape to close, ArrowDown/ArrowUp navigation)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (!isOpen && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }

    if (isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      if (!menuRef.current) return;
      const focusableElements = menuRef.current.querySelectorAll<
        HTMLAnchorElement | HTMLButtonElement
      >('[role="menuitem"]');
      const elementsArray = Array.from(focusableElements);
      const currentIndex = elementsArray.indexOf(
        document.activeElement as HTMLAnchorElement | HTMLButtonElement,
      );

      if (e.key === "ArrowDown") {
        const nextIndex = (currentIndex + 1) % elementsArray.length;
        elementsArray[nextIndex]?.focus();
      } else {
        const prevIndex =
          currentIndex <= 0 ? elementsArray.length - 1 : currentIndex - 1;
        elementsArray[prevIndex]?.focus();
      }
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setIsOpen(false);
        notify.success("You have been logged out successfully.");
      },
      onError: (err) => {
        notify.apiError(err, "Logout failed. Please try again.");
      },
    });
  };

  const navItems = [
    {
      label: "My Profile",
      href: "/profile",
      icon: UserIcon,
    },
    {
      label: "My Orders",
      href: "/orders",
      icon: Package,
    },
    {
      label: "Wishlist",
      href: "/wishlist",
      icon: Heart,
    },
    {
      label: "Cart",
      href: "/cart",
      icon: ShoppingCart,
    },
    {
      label: "Change Password",
      href: "/change-password",
      icon: KeyRound,
    },
  ];

  return (
    <div
      ref={containerRef}
      className="relative inline-block text-left"
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button: Circular Avatar / Orange Icon */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="User account menu"
        className="relative size-9 sm:size-10 rounded-full flex items-center justify-center overflow-hidden transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6200] focus-visible:ring-offset-2 cursor-pointer shrink-0 border border-gray-200 hover:border-[#ff6200]"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={user.name || "User"}
            className="size-full object-cover rounded-full"
          />
        ) : (
          <div className="size-full bg-[#ff6200] flex items-center justify-center text-white rounded-full">
            <UserIcon className="size-5 text-white" />
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 z-50 mt-2.5 w-72 origin-top-right rounded-2xl border border-gray-200/90 bg-white p-2 shadow-[0_14px_40px_-10px_rgba(15,23,42,0.14)] focus:outline-none animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {/* User Info Header */}
          <div className="flex items-center gap-3 rounded-xl bg-gray-50/90 px-3 py-2.5 border border-gray-100">
            <div className="relative size-10 rounded-full flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-[#ff6200]/20">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.name || "User"}
                  className="size-full object-cover rounded-full"
                />
              ) : (
                <div className="size-full bg-[#ff6200] flex items-center justify-center text-white rounded-full">
                  <UserIcon className="size-5 text-white" />
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-sm font-semibold text-gray-900">
                {user.name}
              </span>
              <span className="truncate text-xs text-gray-500">
                {user.email}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="py-2 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  tabIndex={0}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "group flex items-center justify-between rounded-xl px-2.5 py-2 text-sm transition-colors focus:outline-none cursor-pointer",
                    isActive
                      ? "bg-[#ff6200]/10 text-[#ff6200]"
                      : "text-gray-700 hover:bg-orange-50/80 hover:text-[#ff6200] focus:bg-orange-50/80 focus:text-[#ff6200]",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-8 items-center justify-center rounded-lg transition-colors",
                        isActive
                          ? "bg-[#ff6200]/15 text-[#ff6200]"
                          : "bg-gray-100 text-gray-600 group-hover:bg-[#ff6200]/15 group-hover:text-[#ff6200]",
                      )}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden="true" />
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRight
                    className={cn(
                      "size-4 transition-transform group-hover:translate-x-0.5",
                      isActive ? "text-[#ff6200]" : "text-gray-400 group-hover:text-[#ff6200]",
                    )}
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>

          <Separator className="my-1" />

          {/* Logout Action */}
          <div className="pt-1">
            <button
              type="button"
              role="menuitem"
              tabIndex={0}
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors focus:bg-red-50 focus:text-red-700 focus:outline-none cursor-pointer disabled:opacity-50"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-red-50 text-red-600 group-hover:bg-red-100 transition-colors">
                {logoutMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin shrink-0" />
                ) : (
                  <LogOut className="size-4 shrink-0" aria-hidden="true" />
                )}
              </span>
              <span>
                {logoutMutation.isPending ? "Logging out..." : "Log Out"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDropdown;
