import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import React from "react";
import { RiOpenaiFill } from "react-icons/ri";

export interface ChatGPTAvatarProps {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  iconClassName?: string;
}

export const ChatGPTAvatar: React.FC<ChatGPTAvatarProps> = ({
  src,
  alt = "ChatGPT Avatar",
  className,
  fallbackClassName,
  iconClassName,
}) => {
  return (
    <Avatar
      className={cn(
        "w-10 h-10 rounded-full shrink-0 border border-[#E5E7EB] overflow-hidden select-none",
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
          "bg-[#10A37F] text-white flex items-center justify-center rounded-full size-full select-none",
          fallbackClassName,
        )}
      >
        <RiOpenaiFill className={cn("w-3/5 h-3/5 shrink-0 text-white", iconClassName)} />
      </AvatarFallback>
    </Avatar>
  );
};

export default ChatGPTAvatar;
