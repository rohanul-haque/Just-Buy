import React from "react";
import { NavLink } from "react-router";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Settings,
} from "lucide-react";
import JusBuyLogo from "./JusBuyLogo";
import { cn } from "@/lib/utils";

interface VendorSidebarProps {
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
  { label: "Manage Products", to: "/products", icon: Package },
  { label: "Order List", to: "/orders", icon: ClipboardList },
  { label: "Settings", to: "/settings", icon: Settings },
];

export const VendorSidebar: React.FC<VendorSidebarProps> = ({
  isCollapsed = false,
  onItemClick,
}) => {
  return (
    <aside
      className={`h-full bg-white border-r border-[#E5E7EB] flex flex-col justify-between transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? "w-20 px-2" : "w-64 px-4"
      } py-6`}
    >
      {/* Top Branding Section */}
      <div>
        <div className="mb-8 px-2 flex items-center justify-between">
          {!isCollapsed ? (
            <JusBuyLogo className="h-10" />
          ) : (
            <div className="mx-auto">
              <JusBuyLogo className="h-9 [&>div:last-child]:hidden" />
            </div>
          )}
        </div>

        {/* Navigation Items (Standardized with MD rounded corners) */}
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
                      ? "bg-[#E0E7FF] text-[#4F46E5] font-semibold"
                      : "text-[#1F2937] hover:bg-[#F8FAFC] hover:text-[#0F172A]",
                    isCollapsed && "justify-center px-0",
                  )
                }
                title={isCollapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${
                        isActive ? "text-[#4F46E5]" : "text-[#4B5563]"
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
    </aside>
  );
};

export default VendorSidebar;
