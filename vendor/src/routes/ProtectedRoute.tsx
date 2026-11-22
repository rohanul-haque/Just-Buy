import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show a centered loading spinner while session verification completes
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5]" />
          <p className="text-sm font-medium text-[#64748B]">
            Verifying vendor session...
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated or not a VENDOR role, redirect to login page and preserve destination
  if (!isAuthenticated || user?.role !== "VENDOR") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
