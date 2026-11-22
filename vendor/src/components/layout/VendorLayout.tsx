import React, { useState } from "react";
import { Outlet } from "react-router";
import VendorSidebar from "./VendorSidebar";
import VendorHeader from "./VendorHeader";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";

export const VendorLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] font-sans">
      {/* Desktop Sidebar — Always visible on the left side */}
      <div className="hidden md:flex flex-shrink-0 h-full">
        <VendorSidebar isCollapsed={isCollapsed} />
      </div>

      {/* Mobile Drawer Navigation (Sheet) */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-white border-r border-[#E5E7EB]">
          <SheetTitle className="sr-only">Vendor Navigation</SheetTitle>
          <VendorSidebar
            isCollapsed={false}
            onItemClick={() => setIsMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content Area on the right */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAFC]">
        {/* Top Header */}
        <VendorHeader
          onToggleSidebar={toggleSidebar}
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F8FAFC]">
          <div className="space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Toast Notifications */}
      <Toaster richColors position="top-right" />
    </div>
  );
};

export default VendorLayout;
