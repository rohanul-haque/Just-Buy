import React, { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getTimeBasedGreeting } from "@/utils/greeting";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  onOpenMobileSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleSidebar,
  onOpenMobileSidebar,
}) => {
  const { user, adminProfile } = useAuth();
  const [greeting, setGreeting] = useState(getTimeBasedGreeting);

  useEffect(() => {
    // Automatically update greeting based on current local time
    const interval = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const adminName =
    adminProfile?.admin?.name ||
    (adminProfile as any)?.name ||
    user?.name ||
    "Admin";
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
      {/* Left: Sidebar Toggle + Welcome Section */}
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

        {/* Two-Line Left-Aligned Welcome Section */}
        <div className="flex flex-col text-left">
          <h1 className="text-sm sm:text-base md:text-lg font-bold text-[#0F172A] leading-tight">
            Welcome Back, {adminName}
          </h1>
          <span className="text-xs md:text-sm text-[#4B5563] font-normal mt-0.5">
            {greeting}! Have a nice day.
          </span>
        </div>
      </div>

      {/* Right: User Profile (Notification Bell removed) */}
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10 rounded-md border border-[#E5E7EB] shrink-0">
          <AvatarImage
            src={avatarUrl}
            alt={adminName}
            className="rounded-md object-cover"
          />
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
    </header>
  );
};

export default AdminHeader;
