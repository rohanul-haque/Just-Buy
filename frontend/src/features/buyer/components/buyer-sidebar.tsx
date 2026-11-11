"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User as UserIcon,
  Settings,
  Package,
  LogOut,
  Camera,
  Loader2,
} from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useCurrentUser, useLogout } from "@/features/auth/hooks/use-auth";
import {
  useBuyerProfile,
  useUpdateBuyerProfile,
} from "@/features/buyer/hooks/use-buyer";
import notify from "@/lib/toast";
import { cn } from "@/lib/utils";

interface BuyerSidebarProps {
  className?: string;
}

export function BuyerSidebar({ className }: BuyerSidebarProps) {
  const pathname = usePathname();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { data: authUser } = useCurrentUser();
  const { data: profile } = useBuyerProfile();
  const updateProfileMutation = useUpdateBuyerProfile();
  const logoutMutation = useLogout();

  const displayName = profile?.buyer?.name || authUser?.name || "Buyer";
  const displayEmail = profile?.buyer?.email || authUser?.email || "";
  const avatarUrl = profile?.profile?.url || authUser?.avatar;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify.error("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notify.error("Image file size cannot exceed 5MB.");
      return;
    }

    updateProfileMutation.mutate(
      { profileImage: file },
      {
        onSuccess: () => {
          notify.success("Profile photo updated successfully!");
        },
        onError: (err) => {
          notify.apiError(err, "Failed to update profile photo.");
        },
      },
    );
  };

  const navItems = [
    {
      label: "Profile Details",
      href: "/profile",
      icon: UserIcon,
      isActive: pathname === "/profile",
    },
    {
      label: "Settings",
      href: "/profile/settings",
      icon: Settings,
      isActive: pathname === "/profile/settings",
    },
    {
      label: "Order History",
      href: "/orders",
      icon: Package,
      isActive: pathname.startsWith("/orders"),
    },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col items-center sm:items-start w-full md:w-60 lg:w-64 shrink-0 space-y-6",
        className,
      )}
    >
      {/* Profile Header Card */}
      <div className="flex flex-col items-center text-center w-full px-2">
        <div className="relative group">
          <UserAvatar
            src={avatarUrl}
            name={displayName}
            size="lg"
            className="size-20 border-2 border-primary/20 shadow-sm"
          />

          {/* Camera/Upload Overlay Badge */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={updateProfileMutation.isPending}
            className="absolute bottom-0 right-0 p-1.5 rounded-full bg-background border border-border shadow-xs hover:bg-muted text-foreground transition-colors disabled:opacity-50"
            title="Upload profile photo"
            aria-label="Upload profile photo"
          >
            {updateProfileMutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin text-primary" />
            ) : (
              <Camera className="size-3.5 text-muted-foreground" />
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="mt-3 space-y-0.5">
          <h2 className="text-base font-semibold text-foreground tracking-tight">
            {displayName}
          </h2>
          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
            {displayEmail}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex flex-row md:flex-col gap-1.5 w-full overflow-x-auto pb-2 md:pb-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                item.isActive
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Logout action */}
        <button
          type="button"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors whitespace-nowrap disabled:opacity-50 text-left"
        >
          {logoutMutation.isPending ? (
            <Loader2 className="size-4 animate-spin shrink-0" />
          ) : (
            <LogOut className="size-4 shrink-0" />
          )}
          <span>Log out</span>
        </button>
      </nav>
    </aside>
  );
}

