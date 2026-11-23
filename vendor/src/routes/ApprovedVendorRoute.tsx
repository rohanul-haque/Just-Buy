import { useAuth } from "@/hooks/useAuth";
import React from "react";
import { Navigate, Outlet } from "react-router";

interface ApprovedVendorRouteProps {
  children?: React.ReactNode;
}

export const ApprovedVendorRoute: React.FC<ApprovedVendorRouteProps> = ({
  children,
}) => {
  const { vendorProfile } = useAuth();

  // If vendor status is not APPROVED (e.g. PENDING, REJECTED, SUSPENDED, NOT_SUBMITTED)
  // redirect them directly to /settings so they can only manage their profile
  if (vendorProfile && vendorProfile.status !== "APPROVED") {
    return <Navigate to="/settings" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ApprovedVendorRoute;
