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
import { CheckCircle2, Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";

interface VendorApproveDialogProps {
  open: boolean;
  vendor: IVendor | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const VendorApproveDialog: React.FC<VendorApproveDialogProps> = ({
  open,
  vendor,
  onOpenChange,
  onSuccess,
}) => {
  const fetcher = useFetcher<VendorActionResult>();
  const isSubmitting =
    fetcher.state === "submitting" || fetcher.state === "loading";

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        toast.success(
          fetcher.data.message ||
            `Vendor request for "${vendor?.shopName || "merchant"}" approved successfully!`,
        );
        onOpenChange(false);
        onSuccess?.();
      } else if (fetcher.data.error) {
        toast.error(fetcher.data.error);
      }
    }
  }, [fetcher.data, onOpenChange, onSuccess, vendor?.shopName]);

  const handleConfirm = () => {
    if (!vendor) return;

    const formData = new FormData();
    formData.append("vendorId", vendor._id);
    formData.append("intent", "approve");

    fetcher.submit(formData, {
      method: "post",
      action: "/vendors",
    });
  };

  const shopName = vendor?.shopName || "this vendor";
  const vendorName = vendor?.vendor?.name || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 bg-white rounded-md border border-[#E5E7EB] shadow-lg font-sans">
        <DialogHeader className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-md bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <DialogTitle className="text-lg font-bold text-[#0F172A]">
            Approve Vendor Request
          </DialogTitle>
          <DialogDescription className="text-sm text-[#4B5563] max-w-sm">
            Are you sure you want to approve{" "}
            <strong className="text-[#0F172A]">{shopName}</strong>
            {vendorName ? ` (${vendorName})` : ""}? Once approved, this vendor
            will be granted selling privileges and moved to the active Vendor
            List.
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
            className="w-full sm:w-auto rounded-md font-medium text-white shadow-xs bg-[#10B981] hover:bg-[#059669]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Approving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                <span>Approve Request</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VendorApproveDialog;
