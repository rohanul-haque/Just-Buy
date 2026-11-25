import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { PanelLeft } from "lucide-react";
import React from "react";

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
    "Admin";
  const avatarUrl = adminProfile?.profile?.url || null;

  return (
    <header className="bg-[#CB4E01] text-white px-6 py-4 flex items-center justify-between select-none shadow-xs">
      {/* Left: Sidebar Toggle + Welcome Section */}
      <div className="flex items-center gap-4">
        {/* Desktop Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="hidden md:flex rounded-md text-white hover:bg-white/15"
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="w-5 h-5 text-white" />
        </Button>

        {/* Mobile Drawer Open Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileSidebar}
          className="flex md:hidden rounded-md text-white hover:bg-white/15"
          aria-label="Open mobile menu"
        >
          <PanelLeft className="w-5 h-5 text-white" />
        </Button>

        {/* Two-Line Left-Aligned Welcome Section */}
        <div className="flex flex-col text-left">
          <h1 className="text-sm sm:text-base md:text-lg font-bold text-white leading-tight">
            Welcome, {adminName}
          </h1>
          <span className="text-xs md:text-sm text-white/80 font-normal mt-0.5">
            Have a nice day!
          </span>
        </div>
      </div>

      {/* Right: User Profile */}
      <div className="flex items-center gap-3">
        <ProfileAvatar
          src={avatarUrl}
          alt={adminName}
          className="w-10 h-10 rounded-full border-2 border-white/60 shrink-0 shadow-xs"
        />

        <div className="hidden sm:flex flex-col text-left">
          <span className="text-sm font-semibold text-white leading-tight">
            {adminName}
          </span>
          <span className="text-xs text-white/80 font-normal">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
