"use client";

import * as React from "react";
import Image from "next/image";
import { User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-9 text-sm",
  lg: "size-11 text-base",
};

export function UserAvatar({
  src,
  name,
  size = "md",
  className,
  ...props
}: UserAvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  // Compute 1-2 letter initials
  const initials = React.useMemo(() => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [name]);

  const hasValidImage = Boolean(src && !imageError);

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full font-medium overflow-hidden select-none border border-border/80 bg-muted/60 text-foreground transition-colors",
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {hasValidImage ? (
        <Image
          src={src!}
          alt={name ? `${name}'s avatar` : "User avatar"}
          fill
          unoptimized
          sizes="(max-width: 768px) 36px, 44px"
          className="object-cover"
          onError={() => setImageError(true)}
        />
      ) : initials ? (
        <span className="font-semibold text-primary">{initials}</span>
      ) : (
        <UserIcon className="size-1/2 text-muted-foreground" aria-hidden="true" />
      )}
    </div>
  );
}
