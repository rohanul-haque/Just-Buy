import React, { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import categoryService from "@/api/services/category.service";
import { getApiErrorMessage } from "@/api/client";
import { toast } from "sonner";
import type { ICategory } from "@/types/category";

interface DeleteCategoryDialogProps {
  open: boolean;
  category: ICategory | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const DeleteCategoryDialog: React.FC<DeleteCategoryDialogProps> = ({
  open,
  category,
  onOpenChange,
  onSuccess,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!category) return;
    setIsDeleting(true);

    try {
      await categoryService.deleteCategory(category._id);
      toast.success(`Category "${category.name}" deleted successfully!`);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      const message = getApiErrorMessage(error);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-7 bg-white rounded-[16px] border border-[#E5E7EB] shadow-lg font-sans">
        <DialogTitle className="sr-only">Delete Category</DialogTitle>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-[#EF4444]/10 rounded-full text-[#EF4444]">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#0F172A]">Delete Category</h3>
            <p className="text-sm text-[#4B5563]">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[#0F172A]">
                &ldquo;{category?.name}&rdquo;
              </span>
              ? This action cannot be undone.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full pt-2">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => onOpenChange(false)}
              className="flex-1 h-10 py-2 px-5 rounded-full bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#E5E7EB] font-medium text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="flex-1 h-10 py-2 px-5 rounded-full bg-[#EF4444] hover:bg-[#DC2626] text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCategoryDialog;
