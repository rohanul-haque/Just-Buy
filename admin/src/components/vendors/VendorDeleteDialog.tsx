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
import { AlertTriangle, Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";

interface VendorDeleteDialogProps {
  open: boolean;
  vendor: IVendor | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const VendorDeleteDialog: React.FC<VendorDeleteDialogProps> = ({
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
            `Vendor request for "${vendor?.shopName || "merchant"}" rejected successfully.`,
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
    formData.append("intent", "reject");

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
          <div className="w-12 h-12 rounded-md bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <DialogTitle className="text-lg font-bold text-[#0F172A]">
            Reject / Delete Vendor Request
          </DialogTitle>
          <DialogDescription className="text-sm text-[#4B5563] max-w-sm">
            Are you sure you want to reject the vendor request for{" "}
            <strong className="text-[#0F172A]">{shopName}</strong>
            {vendorName ? ` (${vendorName})` : ""}?
            <br />
            <span className="block mt-2 text-xs text-[#6B7280]">
              The request will be rejected. User account details and order records
              remain safely preserved in the database.
            </span>
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
            className="w-full sm:w-auto rounded-md font-medium text-white shadow-xs bg-[#EF4444] hover:bg-[#DC2626]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Rejecting...</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-1.5" />
                <span>Reject Request</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VendorDeleteDialog;
