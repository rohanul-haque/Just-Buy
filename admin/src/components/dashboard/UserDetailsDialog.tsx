import dashboardService from "@/api/services/dashboard.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { IRecentUser, IUserDetails } from "@/types/dashboard";
import {
  Calendar,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  Store,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface UserDetailsDialogProps {
  open: boolean;
  userId: string | null;
  initialUser?: IRecentUser | null;
  onOpenChange: (open: boolean) => void;
}

export const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  open,
  userId,
  initialUser,
  onOpenChange,
}) => {
  const [userDetails, setUserDetails] = useState<IUserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !userId) {
      setUserDetails(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    dashboardService
      .getUserDetails(userId)
      .then((res) => {
        if (isMounted) {
          setUserDetails(res.data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Failed to load user details. Please try again.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [open, userId]);

  if (!open) return null;

  const name = userDetails?.fullName || userDetails?.name || initialUser?.fullName || initialUser?.name || "User";
  const email = userDetails?.email || initialUser?.email || "N/A";
  const role = (userDetails?.role || initialUser?.role || "BUYER").toUpperCase();
  const status = (userDetails?.status || initialUser?.status || "ACTIVE").toUpperCase();
  const avatarUrl = userDetails?.avatar || initialUser?.avatar;
  const createdAt = userDetails?.createdAt || initialUser?.createdAt;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isVendor = role === "VENDOR";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6 bg-white rounded-md border border-[#E5E7EB] shadow-lg font-sans">
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-[#E5E7EB]">
          <div>
            <DialogTitle className="text-xl font-bold text-[#0F172A]">
              User Information
            </DialogTitle>
            <p className="text-xs text-[#4B5563] mt-0.5">
              Verified platform account and profile details
            </p>
          </div>
        </DialogHeader>

        {isLoading && !userDetails ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-md" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-52" />
              </div>
            </div>
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-md bg-[#EF4444]/10 text-[#EF4444] text-xs font-medium my-4">
            {error}
          </div>
        ) : (
          <div className="space-y-5 py-2">
            {/* User Header Card */}
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-16 h-16 rounded-md object-cover border border-[#E5E7EB] shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-md bg-[#E0E7FF] border border-[#C7D2FE] flex items-center justify-center text-[#4F46E5] font-extrabold text-xl shadow-xs">
                  {initials || "U"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-lg font-bold text-[#0F172A] truncate">
                    {name}
                  </h4>
                  <Badge
                    className={
                      isVendor
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold"
                        : "bg-[#E0E7FF] text-[#4F46E5] border-[#C7D2FE] text-xs font-semibold"
                    }
                  >
                    {isVendor ? "Vendor" : "Buyer"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#4B5563] mt-1">
                  <Mail className="w-3.5 h-3.5 text-[#4B5563] shrink-0" />
                  <span className="truncate">{email}</span>
                </div>
              </div>
            </div>

            {/* Account Information Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#F8FAFC] rounded-md border border-[#E5E7EB] text-xs">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-[#4B5563] mt-0.5 shrink-0" />
                <div>
                  <span className="text-[#4B5563] block">Registration Date</span>
                  <span className="font-semibold text-[#0F172A]">
                    {formattedDate}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                {status === "BLOCKED" ? (
                  <ShieldAlert className="w-4 h-4 text-[#EF4444] mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                )}
                <div>
                  <span className="text-[#4B5563] block">Account Status</span>
                  <span
                    className={`font-semibold ${
                      status === "BLOCKED"
                        ? "text-[#EF4444]"
                        : "text-emerald-600"
                    }`}
                  >
                    {status === "BLOCKED" ? "Blocked" : "Active"}
                  </span>
                </div>
              </div>

              {/* Role-specific details */}
              {isVendor ? (
                <>
                  <div className="flex items-start gap-2.5">
                    <Store className="w-4 h-4 text-[#4B5563] mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[#4B5563] block">Shop Name</span>
                      <span className="font-semibold text-[#0F172A]">
                        {userDetails?.shopName || "Not configured"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#4B5563] mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[#4B5563] block">Location</span>
                      <span className="font-semibold text-[#0F172A]">
                        {userDetails?.location || "Not specified"}
                      </span>
                    </div>
                  </div>

                  {userDetails?.licenceNumber && (
                    <div className="flex items-start gap-2.5 sm:col-span-2">
                      <FileText className="w-4 h-4 text-[#4B5563] mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[#4B5563] block">
                          Licence Number
                        </span>
                        <span className="font-semibold text-[#0F172A]">
                          {userDetails.licenceNumber}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-[#4B5563] mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[#4B5563] block">Phone Number</span>
                      <span className="font-semibold text-[#0F172A]">
                        {userDetails?.phoneNumber || "Not provided"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <User className="w-4 h-4 text-[#4B5563] mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[#4B5563] block">Gender</span>
                      <span className="font-semibold text-[#0F172A]">
                        {userDetails?.gender || "Not specified"}
                      </span>
                    </div>
                  </div>

                  {userDetails?.address && (
                    <div className="flex items-start gap-2.5 sm:col-span-2">
                      <MapPin className="w-4 h-4 text-[#4B5563] mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[#4B5563] block">Address</span>
                        <span className="font-semibold text-[#0F172A]">
                          {userDetails.address}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex justify-end pt-3 border-t border-[#E5E7EB]">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-md border-[#E5E7EB] text-[#0F172A] hover:bg-[#F8FAFC]"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
