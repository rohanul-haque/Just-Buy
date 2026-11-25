import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { CategoryActionResult } from "@/routes/actions/category.action";
import type { ICategory } from "@/types/category";
import { AlertTriangle, Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import { useFetcher } from "react-router";
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
  const fetcher = useFetcher<CategoryActionResult>();
  const isDeleting =
    fetcher.state === "submitting" || fetcher.state === "loading";

  useEffect(() => {
    if (fetcher.data && fetcher.data.intent === "delete") {
      if (fetcher.data.success) {
        toast.success(
          fetcher.data.message ||
            `Category "${category?.name || ""}" deleted successfully!`,
        );
        onOpenChange(false);
        onSuccess?.();
      } else if (fetcher.data.error) {
        toast.error(fetcher.data.error);
      }
    }
  }, [fetcher.data, category?.name, onOpenChange, onSuccess]);

  const handleDelete = () => {
    if (!category) return;
    const formData = new FormData();
    formData.append("intent", "delete");
    formData.append("categoryId", category._id);

    fetcher.submit(formData, {
      method: "post",
      action: "/categories",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 bg-[#FFE7D9] rounded-xl border border-[#ffceb0]/80 shadow-lg font-sans">
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
              className="flex-1 h-10 rounded-md border-[#ffceb0]/80 text-[#0F172A] hover:bg-white/80"
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
