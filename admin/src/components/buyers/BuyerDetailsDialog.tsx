import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { IBuyer } from "@/types/buyer";
import {
  Calendar,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  User,
} from "lucide-react";
import React from "react";

interface BuyerDetailsDialogProps {
  open: boolean;
  buyer: IBuyer | null;
  onOpenChange: (open: boolean) => void;
}

export const BuyerDetailsDialog: React.FC<BuyerDetailsDialogProps> = ({
  open,
  buyer,
  onOpenChange,
}) => {
  if (!buyer) return null;

  const user = buyer.buyer;
  const name = user?.name || "Anonymous Buyer";
  const email = user?.email || "No email";
  const phone = buyer.phoneNumber || "Not provided";
  const address = buyer.address || "Not provided";
  const gender = buyer.gender || "Not specified";
  const isBlocked = user?.status === "BLOCKED";
  const joinDate = user?.createdAt || buyer.createdAt;
  const formattedJoinDate = joinDate
    ? new Date(joinDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  const avatarUrl = buyer.profile?.url;
  const initials = (name || "B")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6 bg-white rounded-md border border-[#E5E7EB] shadow-lg font-sans">
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-[#E5E7EB]">
          <div>
            <DialogTitle className="text-xl font-bold text-[#0F172A]">
              Buyer Profile
            </DialogTitle>
            <p className="text-xs text-[#4B5563] mt-0.5">
              Detailed account and contact information
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
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#0F172A] leading-tight">
                {name}
              </h3>
              <Badge
                variant="secondary"
                className={`rounded-md text-xs font-semibold px-2 py-0.5 ${
                  isBlocked
                    ? "bg-[#EF4444]/10 text-[#EF4444] border-transparent"
                    : "bg-[#10B981]/10 text-[#10B981] border-transparent"
                }`}
              >
                {isBlocked ? (
                  <span className="flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Blocked
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                )}
              </Badge>
            </div>
            <p className="text-xs text-[#6B7280]">
              Account ID: <span className="font-mono text-[#111827]">{buyer._id}</span>
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
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
              <Phone className="w-3.5 h-3.5 text-[#6366F1]" />
              <span>Phone Number</span>
            </div>
            <p className="text-sm font-semibold text-[#0F172A]">{phone}</p>
          </div>

          <div className="p-3 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#4B5563] font-medium">
              <User className="w-3.5 h-3.5 text-[#6366F1]" />
              <span>Gender</span>
            </div>
            <p className="text-sm font-semibold text-[#0F172A] capitalize">
              {gender.toLowerCase()}
            </p>
          </div>

          <div className="p-3 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#4B5563] font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#6366F1]" />
              <span>Join Date</span>
            </div>
            <p className="text-sm font-semibold text-[#0F172A]">
              {formattedJoinDate}
            </p>
          </div>

          <div className="sm:col-span-2 p-3 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#4B5563] font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#6366F1]" />
              <span>Shipping / Billing Address</span>
            </div>
            <p className="text-sm text-[#0F172A]">
              {address}
            </p>
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

export default BuyerDetailsDialog;
