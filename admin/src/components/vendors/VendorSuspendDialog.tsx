import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { IVendor, VendorActionResult } from "@/types/vendor";
import { Ban, Loader2, ShieldCheck } from "lucide-react";
import React, { useEffect } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";

interface VendorSuspendDialogProps {
  open: boolean;
  vendor: IVendor | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const VendorSuspendDialog: React.FC<VendorSuspendDialogProps> = ({
  open,
  vendor,
  onOpenChange,
  onSuccess,
}) => {
  const fetcher = useFetcher<VendorActionResult>();
  const isSubmitting =
    fetcher.state === "submitting" || fetcher.state === "loading";

  const isCurrentlySuspended = vendor?.status === "SUSPENDED";
  const targetIntent = isCurrentlySuspended ? "unsuspend" : "suspend";

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        toast.success(
          fetcher.data.message ||
            (targetIntent === "unsuspend"
              ? "Vendor shop re-activated successfully!"
              : "Vendor shop suspended successfully."),
        );
        onOpenChange(false);
        onSuccess?.();
      } else if (fetcher.data.error) {
        toast.error(fetcher.data.error);
      }
    }
  }, [fetcher.data, onOpenChange, onSuccess, targetIntent]);

  const handleConfirm = () => {
    if (!vendor) return;

    const formData = new FormData();
    formData.append("vendorId", vendor._id);
    formData.append("intent", targetIntent);

    fetcher.submit(formData, {
      method: "post",
      action: "/vendors",
    });
  };

  const shopName = vendor?.shopName || "this vendor";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 bg-[#FFE7D9] rounded-xl border border-[#ffceb0]/80 shadow-lg font-sans">
        <DialogHeader className="flex flex-col items-center text-center space-y-3">
          <div
            className={`w-12 h-12 rounded-md flex items-center justify-center ${
              isCurrentlySuspended
                ? "bg-[#10B981]/10 text-[#10B981]"
                : "bg-[#F59E0B]/10 text-[#D97706]"
            }`}
          >
            {isCurrentlySuspended ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <Ban className="w-6 h-6" />
            )}
          </div>
          <DialogTitle className="text-lg font-bold text-[#0F172A]">
            {isCurrentlySuspended
              ? "Re-activate Vendor Shop"
              : "Suspend Vendor Shop"}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#4B5563] max-w-sm">
            {isCurrentlySuspended ? (
              <span>
                Are you sure you want to re-activate{" "}
                <strong className="text-[#0F172A]">{shopName}</strong>? Selling
                privileges will be restored.
              </span>
            ) : (
              <span>
                Are you sure you want to suspend{" "}
                <strong className="text-[#0F172A]">{shopName}</strong>? The shop
                will not be able to sell products until re-activated by an admin.
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
            className="w-full sm:w-auto rounded-md border-[#ffceb0]/80 text-[#1F2937] hover:bg-white/80"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`w-full sm:w-auto rounded-md font-medium text-white shadow-xs ${
              isCurrentlySuspended
                ? "bg-[#10B981] hover:bg-[#059669]"
                : "bg-[#D97706] hover:bg-[#B45309]"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Processing...</span>
              </>
            ) : isCurrentlySuspended ? (
              <>
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                <span>Re-activate Shop</span>
              </>
            ) : (
              <>
                <Ban className="w-4 h-4 mr-1.5" />
                <span>Suspend Shop</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VendorSuspendDialog;
