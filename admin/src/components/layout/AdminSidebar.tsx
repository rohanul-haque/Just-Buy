import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  LogOut,
  Settings,
  Store,
  Tags,
  Users,
  Wallet,
} from "lucide-react";
import React from "react";
import { NavLink, useNavigate } from "react-router";
import JusBuyLogo from "./JusBuyLogo";

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onItemClick?: () => void;
}

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Earnings", to: "/earnings", icon: Wallet },
  { label: "Buyers", to: "/buyers", icon: Users },
  { label: "Vendors", to: "/vendors", icon: Store },
  { label: "Categories", to: "/categories", icon: Tags },
  { label: "Settings", to: "/settings", icon: Settings },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed = false,
  onItemClick,
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (onItemClick) onItemClick();
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className={`h-full bg-[#CB4E01] text-white flex flex-col justify-between transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? "w-20 px-2" : "w-64 px-4"
      } py-6`}
    >
      {/* Top Branding Section */}
      <div>
        <div className="mb-8 px-2 flex items-center justify-between">
          {!isCollapsed ? (
            <JusBuyLogo className="h-11" variant="white" />
          ) : (
            <div className="mx-auto flex justify-center">
              <JusBuyLogo className="h-9 w-9 overflow-hidden" variant="white" />
            </div>
          )}
        </div>

        {/* Navigation Items (White Pill for active, soft hover for others) */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onItemClick}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3.5 px-4 py-2.5 rounded-md text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "bg-[#E9E9E9] text-[#CB4E01] font-bold shadow-xs"
                      : "text-white/90 hover:bg-white/15 hover:text-white",
                    isCollapsed && "justify-center px-0",
                  )
                }
                title={isCollapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${
                        isActive ? "text-[#CB4E01]" : "text-white"
                      }`}
                    />
                    {!isCollapsed && <span>{item.label}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Log Out Section */}
      <div className="pt-4 border-t border-white/20">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3.5 px-4 py-2.5 rounded-md text-sm font-medium text-white/90 hover:text-white hover:bg-white/15 transition-colors cursor-pointer justify-start",
            isCollapsed && "justify-center px-0",
          )}
          title={isCollapsed ? "Log Out" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0 text-white" />
          {!isCollapsed && <span>Log Out</span>}
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
