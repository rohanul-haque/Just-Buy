import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
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
  iconClassName,
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
          "bg-white flex items-center justify-center rounded-full size-full select-none text-gray-500",
          fallbackClassName,
        )}
      >
        <User className={cn("w-1/2 h-1/2 shrink-0 text-gray-500", iconClassName)} />
      </AvatarFallback>
    </Avatar>
  );
};

export default ProfileAvatar;
