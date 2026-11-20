import { getApiErrorMessage } from "@/api/client";
import { categoryKeys } from "@/api/queries/category.queries";
import categoryService from "@/api/services/category.service";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { ICategory } from "@/types/category";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface DeleteCategoryDialogProps {
  open: boolean;
  category: ICategory | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const DeleteCategoryDialog: React.FC<DeleteCategoryDialogProps> = ({
  open,
  category,
  onOpenChange,
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success(`Category "${category?.name}" deleted successfully!`);
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      toast.error(message);
    },
  });

  const handleDelete = () => {
    if (!category) return;
    deleteMutation.mutate(category._id);
  };

  const isDeleting = deleteMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 bg-white rounded-md border border-[#E5E7EB] shadow-lg font-sans">
        <DialogTitle className="sr-only">Delete Category</DialogTitle>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-[#EF4444]/10 rounded-md text-[#EF4444]">
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
            <Button
              variant="outline"
              disabled={isDeleting}
              onClick={() => onOpenChange(false)}
              className="flex-1 h-10 rounded-md border-[#E5E7EB] text-[#0F172A] hover:bg-[#F8FAFC]"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
              className="flex-1 h-10 rounded-md bg-[#EF4444] hover:bg-[#DC2626] text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>Deleting...</span>
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCategoryDialog;
