import React, { useState } from "react";
import { Outlet } from "react-router";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";

export const AdminLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0 h-full">
        <AdminSidebar isCollapsed={isCollapsed} />
      </div>

      {/* Mobile Drawer (Sheet) */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-white border-r border-[#E5E7EB]">
          <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
          <AdminSidebar
            isCollapsed={false}
            onItemClick={() => setIsMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAFC]">
        {/* Header */}
        <AdminHeader
          onToggleSidebar={toggleSidebar}
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
        />

        {/* Content Area with Surface Muted Background */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Toast Notifications */}
      <Toaster richColors position="top-right" />
    </div>
  );
};

export default AdminLayout;
