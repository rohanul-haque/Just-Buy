import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { IVendor, VendorStatus } from "@/types/vendor";
import {
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileText,
  IdCard,
  Mail,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Store,
  User,
} from "lucide-react";
import React from "react";

interface VendorDetailsDialogProps {
  open: boolean;
  vendor: IVendor | null;
  onOpenChange: (open: boolean) => void;
}

export const VendorDetailsDialog: React.FC<VendorDetailsDialogProps> = ({
  open,
  vendor,
  onOpenChange,
}) => {
  if (!vendor) return null;

  const user = vendor.vendor;
  const name = user?.name || "Merchant";
  const email = user?.email || "No email";
  const shopName = vendor.shopName || "Store name not set";
  const location = vendor.location || "Location not provided";
  const licence = vendor.licenceNumber || "Not registered";
  const joinDate = user?.createdAt || vendor.createdAt;
  const formattedJoinDate = joinDate
    ? new Date(joinDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  const isEmailVerified = user?.verification?.isEmailVerified;
  const avatarUrl = vendor.profile?.url;
  const nidFront = vendor.nidFrontImage?.url;
  const nidBack = vendor.nidBackImage?.url;

  const initials = (name || "V")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const getStatusBadge = (status: VendorStatus) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-[#10B981]/10 text-[#10B981] border-transparent font-semibold">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-transparent font-semibold">
            Pending Request
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-[#EF4444]/10 text-[#EF4444] border-transparent font-semibold">
            Rejected
          </Badge>
        );
      case "SUSPENDED":
        return (
          <Badge className="bg-[#6B7280]/10 text-[#6B7280] border-transparent font-semibold">
            Suspended
          </Badge>
        );
      default:
        return (
          <Badge className="bg-[#E5E7EB] text-[#374151] border-transparent font-semibold">
            {status}
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 bg-white rounded-md border border-[#E5E7EB] shadow-lg font-sans">
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-[#E5E7EB]">
          <div>
            <DialogTitle className="text-xl font-bold text-[#0F172A]">
              Vendor Profile & Verification
            </DialogTitle>
            <p className="text-xs text-[#4B5563] mt-0.5">
              Comprehensive merchant details and submitted credentials
            </p>
          </div>
        </DialogHeader>

        {/* Profile Card Header */}
        <div className="flex items-center gap-4 py-2">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-16 h-16 rounded-md object-cover border border-[#E5E7EB] shadow-xs"
            />
          ) : (
            <div className="w-16 h-16 rounded-md bg-[#E0E7FF] text-[#4F46E5] font-bold text-xl flex items-center justify-center border border-[#C7D2FE] shadow-xs">
              {initials}
            </div>
          )}

          <div className="space-y-1 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-[#0F172A] leading-tight">
                {shopName}
              </h3>
              {getStatusBadge(vendor.status)}
              {isEmailVerified !== undefined && (
                <Badge
                  variant="outline"
                  className={`rounded-md text-[11px] font-medium ${
                    isEmailVerified
                      ? "text-[#10B981] border-[#A7F3D0] bg-[#ECFDF5]"
                      : "text-[#EF4444] border-[#FECACA] bg-[#FEF2F2]"
                  }`}
                >
                  {isEmailVerified ? (
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Email Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Email Unverified
                    </span>
                  )}
                </Badge>
              )}
            </div>
            <p className="text-xs text-[#6B7280]">
              Merchant Contact: <span className="text-[#111827] font-medium">{name}</span>
            </p>
            <p className="text-xs text-[#6B7280]">
              Vendor ID: <span className="font-mono text-[#111827]">{vendor._id}</span>
            </p>
          </div>
        </div>

        {/* Personal & Shop Information Grid */}
        <div className="space-y-4 pt-2">
          <div>
            <h4 className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider mb-2">
              Account & Shop Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#4B5563] font-medium">
                  <User className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span>Full Name</span>
                </div>
                <p className="text-sm font-semibold text-[#0F172A]">{name}</p>
              </div>

              <div className="p-3 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#4B5563] font-medium">
                  <Mail className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span>Email Address</span>
                </div>
                <p className="text-sm font-semibold text-[#0F172A] truncate">
                  {email}
                </p>
              </div>

              <div className="p-3 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#4B5563] font-medium">
                  <Store className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span>Shop Name</span>
                </div>
                <p className="text-sm font-semibold text-[#0F172A]">{shopName}</p>
              </div>

              <div className="p-3 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#4B5563] font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span>Shop Location</span>
                </div>
                <p className="text-sm font-semibold text-[#0F172A]">{location}</p>
              </div>

              <div className="p-3 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#4B5563] font-medium">
                  <FileText className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span>Trade / Business Licence</span>
                </div>
                <p className="text-sm font-semibold text-[#0F172A] font-mono">
                  {licence}
                </p>
              </div>

              <div className="p-3 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#4B5563] font-medium">
                  <Calendar className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span>Registration Date</span>
                </div>
                <p className="text-sm font-semibold text-[#0F172A]">
                  {formattedJoinDate}
                </p>
              </div>
            </div>
          </div>

          {/* Verification Documents (NID Front & Back) */}
          <div>
            <h4 className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <IdCard className="w-3.5 h-3.5 text-[#6366F1]" />
              <span>Identity Verification Documents</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] space-y-2">
                <span className="text-xs font-medium text-[#4B5563]">
                  NID Document (Front)
                </span>
                {nidFront ? (
                  <div className="space-y-1.5">
                    <img
                      src={nidFront}
                      alt="NID Front"
                      className="w-full h-36 object-contain rounded-md bg-white border border-[#E5E7EB]"
                    />
                    <a
                      href={nidFront}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#4F46E5] hover:underline"
                    >
                      <span>View full image</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <div className="h-28 rounded-md bg-[#F1F5F9] border border-dashed border-[#CBD5E1] flex items-center justify-center text-xs text-[#94A3B8]">
                    No front document uploaded
                  </div>
                )}
              </div>

              <div className="p-3 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] space-y-2">
                <span className="text-xs font-medium text-[#4B5563]">
                  NID Document (Back)
                </span>
                {nidBack ? (
                  <div className="space-y-1.5">
                    <img
                      src={nidBack}
                      alt="NID Back"
                      className="w-full h-36 object-contain rounded-md bg-white border border-[#E5E7EB]"
                    />
                    <a
                      href={nidBack}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#4F46E5] hover:underline"
                    >
                      <span>View full image</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <div className="h-28 rounded-md bg-[#F1F5F9] border border-dashed border-[#CBD5E1] flex items-center justify-center text-xs text-[#94A3B8]">
                    No back document uploaded
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 mt-2 border-t border-[#E5E7EB] flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-md border-[#E5E7EB] text-[#1F2937] hover:bg-[#F8FAFC]"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VendorDetailsDialog;
