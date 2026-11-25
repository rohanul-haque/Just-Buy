"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User as UserIcon,
  Settings,
  List,
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

  const displayName = profile?.buyer?.name || authUser?.name || "Cameron Williamson";
  const displayEmail = profile?.buyer?.email || authUser?.email || "deanna.curtis@example.com";
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
      icon: List,
      isActive: pathname.startsWith("/orders"),
    },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col items-center sm:items-start w-full md:w-56 lg:w-64 shrink-0 space-y-7",
        className,
      )}
    >
      {/* Profile Header Card */}
      <div className="flex flex-col items-center text-center w-full px-2">
        <div className="relative">
          <UserAvatar
            src={avatarUrl}
            name={displayName}
            size="lg"
            className="size-24 border border-neutral-200 shadow-2xs"
          />

          {/* Camera/Upload Overlay Badge */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={updateProfileMutation.isPending}
            className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white border border-neutral-400 shadow-xs hover:bg-neutral-50 text-neutral-700 transition-colors disabled:opacity-50 cursor-pointer"
            title="Upload profile photo"
            aria-label="Upload profile photo"
          >
            {updateProfileMutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin text-[#ff6200]" />
            ) : (
              <Camera className="size-3.5 text-neutral-600" />
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

        <div className="mt-3.5 space-y-0.5">
          <h2 className="text-base sm:text-lg font-medium text-neutral-900 tracking-tight">
            {displayName}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 truncate max-w-[210px]">
            {displayEmail}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex flex-row md:flex-col gap-2 w-full overflow-x-auto pb-2 md:pb-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3.5 px-4 py-3 rounded-md text-sm sm:text-base font-normal transition-all whitespace-nowrap",
                item.isActive
                  ? "bg-[#ff6200] text-white shadow-none"
                  : "text-neutral-800 hover:bg-neutral-100",
              )}
            >
              <Icon className="size-5 shrink-0 stroke-[1.8]" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Logout action */}
        <button
          type="button"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="flex items-center gap-3.5 px-4 py-3 rounded-md text-sm sm:text-base font-normal text-neutral-800 hover:bg-neutral-100 transition-colors whitespace-nowrap disabled:opacity-50 text-left cursor-pointer w-full"
        >
          {logoutMutation.isPending ? (
            <Loader2 className="size-5 animate-spin shrink-0 text-[#ff6200]" />
          ) : (
            <LogOut className="size-5 shrink-0 stroke-[1.8]" />
          )}
          <span>Log out</span>
        </button>
      </nav>
    </aside>
  );
}
