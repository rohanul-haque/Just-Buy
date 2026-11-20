import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BuyerActionResult, IBuyer } from "@/types/buyer";
import { AlertTriangle, Ban, Loader2, ShieldCheck } from "lucide-react";
import React, { useEffect } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";

interface BuyerDeleteDialogProps {
  open: boolean;
  buyer: IBuyer | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const BuyerDeleteDialog: React.FC<BuyerDeleteDialogProps> = ({
  open,
  buyer,
  onOpenChange,
  onSuccess,
}) => {
  const fetcher = useFetcher<BuyerActionResult>();
  const isSubmitting =
    fetcher.state === "submitting" || fetcher.state === "loading";

  const isCurrentlyBlocked = buyer?.buyer?.status === "BLOCKED";
  const targetIntent = isCurrentlyBlocked ? "unblock" : "block";

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        toast.success(
          fetcher.data.message ||
            (targetIntent === "unblock"
              ? "Buyer account activated successfully."
              : "Buyer account soft-deleted/blocked successfully."),
        );
        onOpenChange(false);
        onSuccess?.();
      } else if (fetcher.data.error) {
        toast.error(fetcher.data.error);
      }
    }
  }, [fetcher.data, onOpenChange, onSuccess, targetIntent]);

  const handleConfirm = () => {
    if (!buyer) return;

    const formData = new FormData();
    formData.append("buyerId", buyer._id);
    formData.append("intent", targetIntent);

    fetcher.submit(formData, {
      method: "post",
      action: "/buyers",
    });
  };

  const buyerName = buyer?.buyer?.name || "this buyer";
  const buyerEmail = buyer?.buyer?.email || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 bg-white rounded-md border border-[#E5E7EB] shadow-lg font-sans">
        <DialogHeader className="flex flex-col items-center text-center space-y-3">
          <div
            className={`w-12 h-12 rounded-md flex items-center justify-center ${
              isCurrentlyBlocked
                ? "bg-[#10B981]/10 text-[#10B981]"
                : "bg-[#EF4444]/10 text-[#EF4444]"
            }`}
          >
            {isCurrentlyBlocked ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <Ban className="w-6 h-6" />
            )}
          </div>
          <DialogTitle className="text-lg font-bold text-[#0F172A]">
            {isCurrentlyBlocked
              ? "Unblock Buyer Account"
              : "Soft Delete / Block Buyer"}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#4B5563] max-w-sm">
            {isCurrentlyBlocked ? (
              <span>
                Are you sure you want to reactivate the account for{" "}
                <strong className="text-[#0F172A]">{buyerName}</strong>
                {buyerEmail ? ` (${buyerEmail})` : ""}? They will regain access to
                their orders and platform features.
              </span>
            ) : (
              <span>
                Are you sure you want to soft-delete / block{" "}
                <strong className="text-[#0F172A]">{buyerName}</strong>
                {buyerEmail ? ` (${buyerEmail})` : ""}?
                <br />
                <span className="block mt-2 text-xs text-[#6B7280]">
                  Buyer records, reviews, and order history are securely
                  preserved in the database. Active sessions will be terminated.
                </span>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="w-full sm:w-auto rounded-md border-[#E5E7EB] text-[#1F2937] hover:bg-[#F8FAFC]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`w-full sm:w-auto rounded-md font-medium text-white shadow-xs ${
              isCurrentlyBlocked
                ? "bg-[#10B981] hover:bg-[#059669]"
                : "bg-[#EF4444] hover:bg-[#DC2626]"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Processing...</span>
              </>
            ) : isCurrentlyBlocked ? (
              <>
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                <span>Unblock Account</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-1.5" />
                <span>Block Buyer</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BuyerDeleteDialog;
