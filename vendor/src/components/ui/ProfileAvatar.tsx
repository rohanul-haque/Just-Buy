import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import React from "react";

export interface ProfileAvatarProps {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  iconClassName?: string;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  src,
  alt = "Profile Avatar",
  className,
  fallbackClassName,
}) => {
  return (
    <Avatar
      className={cn(
        "w-10 h-10 rounded-full shrink-0 border border-[#E5E7EB] bg-white overflow-hidden select-none",
        className,
      )}
    >
      {src ? (
        <AvatarImage
          src={src}
          alt={alt}
          className="rounded-full object-cover size-full"
        />
      ) : null}
      <AvatarFallback
        className={cn(
          "bg-[#F1F5F9] flex items-center justify-center rounded-full size-full select-none",
          fallbackClassName,
        )}
      />
    </Avatar>
  );
};

export default ProfileAvatar;
