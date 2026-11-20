import React from "react";
import { Menu, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  onOpenMobileSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleSidebar,
  onOpenMobileSidebar,
}) => {
  const { user, adminProfile } = useAuth();

  const adminName =
    adminProfile?.admin?.name ||
    (adminProfile as any)?.name ||
    user?.name ||
    "James";
  const avatarUrl =
    adminProfile?.profile?.url ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between select-none">
      {/* Left: Sidebar Toggle + Greeting */}
      <div className="flex items-center gap-4">
        {/* Desktop Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="hidden md:flex rounded-md text-[#1F2937] hover:bg-[#F8FAFC]"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Mobile Drawer Open Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileSidebar}
          className="flex md:hidden rounded-md text-[#1F2937] hover:bg-[#F8FAFC]"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Welcome message */}
        <div className="flex flex-col">
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-[#0F172A] leading-tight">
            Welcome, {adminName}
          </h1>
          <span className="text-xs md:text-sm text-[#4B5563] font-normal">
            Have a nice day!
          </span>
        </div>
      </div>

      {/* Right: Notifications + Admin Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            className="rounded-md bg-[#F8FAFC] border-[#E5E7EB] text-[#1F2937] hover:text-[#4F46E5] hover:bg-[#E0E7FF]"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
          </Button>
          <Badge className="absolute -top-1.5 -right-1.5 bg-[#EF4444] text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-md flex items-center justify-center border-none">
            2
          </Badge>
        </div>

        {/* Admin Avatar + Info */}
        <div className="flex items-center gap-3 pl-2 border-l border-[#E5E7EB]">
          <Avatar className="w-10 h-10 rounded-md border border-[#E5E7EB]">
            <AvatarImage src={avatarUrl} alt={adminName} className="rounded-md" />
            <AvatarFallback className="bg-[#E0E7FF] text-[#4F46E5] text-sm font-semibold rounded-md">
              {getInitials(adminName)}
            </AvatarFallback>
          </Avatar>

          <div className="hidden sm:flex flex-col text-left">
            <span className="text-sm font-semibold text-[#0F172A] leading-tight">
              {adminName}
            </span>
            <span className="text-xs text-[#4B5563] font-normal">
              Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
