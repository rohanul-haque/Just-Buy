import React, { useEffect, useState } from "react";
import { PanelLeft } from "lucide-react";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { getTimeBasedGreeting } from "@/utils/greeting";
import { useAuth } from "@/hooks/useAuth";

interface VendorHeaderProps {
  onToggleSidebar: () => void;
  onOpenMobileSidebar?: () => void;
}

export const VendorHeader: React.FC<VendorHeaderProps> = ({
  onToggleSidebar,
  onOpenMobileSidebar,
}) => {
  const [greeting, setGreeting] = useState(getTimeBasedGreeting);
  const { user, vendorProfile } = useAuth();

  useEffect(() => {
    // Automatically update greeting based on current local time
    const interval = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const vendorName =
    vendorProfile?.vendor?.name || user?.name || "Vendor";
  const avatarUrl = vendorProfile?.profile?.url;

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
          <PanelLeft className="w-5 h-5" />
        </Button>

        {/* Mobile Drawer Open Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileSidebar}
          className="flex md:hidden rounded-md text-[#1F2937] hover:bg-[#F8FAFC]"
          aria-label="Open mobile menu"
        >
          <PanelLeft className="w-5 h-5" />
        </Button>

        {/* Two-Line Left-Aligned Welcome Section */}
        <div className="flex flex-col text-left">
          <h1 className="text-sm sm:text-base md:text-lg font-bold text-[#0F172A] leading-tight">
            Welcome Back, {vendorName}
          </h1>
          <span className="text-xs md:text-sm text-[#4B5563] font-normal mt-0.5">
            {greeting}! Have a nice day.
          </span>
        </div>
      </div>

      {/* Right: User Profile */}
      <div className="flex items-center gap-3">
        <ProfileAvatar
          src={avatarUrl}
          alt={vendorName}
          className="w-10 h-10 rounded-full border border-[#E5E7EB] shrink-0 shadow-xs"
        />

        <div className="hidden sm:flex flex-col text-left">
          <span className="text-sm font-semibold text-[#0F172A] leading-tight">
            {vendorName}
          </span>
          <span className="text-xs text-[#4B5563] font-normal">
            Vendor
          </span>
        </div>
      </div>
    </header>
  );
};

export default VendorHeader;
