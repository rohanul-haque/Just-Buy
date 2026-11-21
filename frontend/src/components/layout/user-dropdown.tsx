"use client";

import * as React from "react";
import Link from "next/link";
import {
  User as UserIcon,
  Package,
  Heart,
  ShoppingCart,
  KeyRound,
  LogOut,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Separator } from "@/components/ui/separator";
import { useLogout } from "@/features/auth/hooks/use-auth";
import type { User } from "@/features/auth/types";
import notify from "@/lib/toast";

interface UserDropdownProps {
  user: User;
}

export function UserDropdown({ user }: UserDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const logoutMutation = useLogout();

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
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="User account menu"
        className="flex items-center gap-2 rounded-full p-1 pl-1.5 pr-2.5 text-sm font-medium hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
      >
        <UserAvatar
          src={user.avatar}
          name={user.name}
          size="sm"
          className="border border-border"
        />
        <span className="hidden lg:inline-block max-w-[120px] truncate font-medium text-foreground">
          {user.name}
        </span>
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-xl border border-border bg-card p-1 shadow-lg focus:outline-none animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {/* User Info Header */}
          <div className="flex items-center gap-3 px-3 py-2.5">
            <UserAvatar
              src={user.avatar}
              name={user.name}
              size="md"
              className="border border-border shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="truncate text-sm font-semibold text-foreground">
                {user.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>

          <Separator className="my-1" />

          {/* Navigation Links */}
          <div className="py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted focus:bg-muted focus:outline-none transition-colors"
                >
                  <Icon className="size-4 text-muted-foreground" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <Separator className="my-1" />

          {/* Logout Action */}
          <div className="p-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:outline-none transition-colors disabled:opacity-50"
            >
              {logoutMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut className="size-4" />
                  <span>Logout</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

