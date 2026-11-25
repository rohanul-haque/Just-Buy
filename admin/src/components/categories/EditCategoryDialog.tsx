import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CategoryActionResult } from "@/routes/actions/category.action";
import type { ICategory } from "@/types/category";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";

interface EditCategoryDialogProps {
  open: boolean;
  category: ICategory | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const EditCategoryDialog: React.FC<EditCategoryDialogProps> = ({
  open,
  category,
  onOpenChange,
  onSuccess,
}) => {
  const fetcher = useFetcher<CategoryActionResult>();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSubmitting =
    fetcher.state === "submitting" || fetcher.state === "loading";

  const handleRemoveImage = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleClose = useCallback(() => {
    setSelectedFile(null);
    setValidationError(null);
    onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setStatus(category.isActive !== false ? "active" : "inactive");
      setPreviewUrl(category.image?.url || null);
      setSelectedFile(null);
      setValidationError(null);
    }
  }, [category]);

  useEffect(() => {
    if (fetcher.data && fetcher.data.intent === "update") {
      if (fetcher.data.success) {
        toast.success(fetcher.data.message || "Category updated successfully!");
        handleClose();
        onSuccess?.();
      } else if (fetcher.data.error) {
        setValidationError(fetcher.data.error);
        toast.error(fetcher.data.error);
      }
    }
  }, [fetcher.data, handleClose, onSuccess]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setValidationError(
          "Please select a valid image file (JPEG, PNG, WEBP).",
        );
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setValidationError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;

    const trimmed = name.trim();
    if (!trimmed) {
      setValidationError("Category name is required.");
      return;
    }
    if (trimmed.length > 100) {
      setValidationError("Category name cannot exceed 100 characters.");
      return;
    }

    setValidationError(null);

    const formData = new FormData();
    formData.append("intent", "update");
    formData.append("categoryId", category._id);
    formData.append("name", trimmed);
    formData.append("isActive", String(status === "active"));
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    fetcher.submit(formData, {
      method: "post",
      action: "/categories",
      encType: "multipart/form-data",
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-6 bg-[#FFE7D9] rounded-xl border border-[#ffceb0]/80 shadow-lg overflow-hidden font-sans">
        <DialogTitle className="sr-only">Edit category</DialogTitle>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="w-8 h-8 rounded-md text-[#1F2937] hover:bg-white/80"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-bold text-[#0F172A]">Edit category</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Name */}
          <div className="space-y-2">
            <Label
              htmlFor="edit-category-name"
              className="text-sm font-medium text-[#111827] block"
            >
              Category name
            </Label>
            <Input
              id="edit-category-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="Enter category name"
              disabled={isSubmitting}
              className="w-full h-10 px-3 rounded-md border-[#ffceb0]/80 bg-white text-[#0F172A] text-sm"
            />
          </div>

          {/* Status Selection (Active / Inactive) */}
          <div className="space-y-2">
            <Label
              htmlFor="edit-category-status"
              className="text-sm font-medium text-[#111827] block"
            >
              Status
            </Label>
            <Select
              value={status}
              onValueChange={(val: "active" | "inactive") => setStatus(val)}
              disabled={isSubmitting}
            >
              <SelectTrigger
                id="edit-category-status"
                className="w-full h-10 px-3 rounded-md border-[#ffceb0]/80 bg-white text-[#0F172A] text-sm"
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="rounded-md border-[#ffceb0]/80 bg-white shadow-md">
                <SelectItem value="active" className="text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </SelectItem>
                <SelectItem value="inactive" className="text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    Inactive
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Update Category Image */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#111827] block">
              Update category Image
            </Label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
            />

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-[#ffceb0]/80 bg-white/80 rounded-md p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#F1F5F9] transition-colors"
              >
                <div className="p-2.5 rounded-md bg-white border border-[#ffceb0]/80 text-[#fe6201]">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-[#111827]">
                  Update image
                </span>
                <span className="text-xs text-[#4B5563]">
                  PNG, JPG or WEBP (up to 5MB)
                </span>
              </div>
            ) : (
              <div className="relative border border-[#ffceb0]/80 rounded-md p-2 bg-white flex items-center gap-3">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#0F172A] truncate">
                    {selectedFile
                      ? selectedFile.name
                      : category?.name || "Current image"}
                  </p>
                  <p className="text-[11px] text-[#4B5563]">
                    {selectedFile
                      ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                      : "Existing image"}
                  </p>
                  <Button
                    variant="link"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-0 h-auto text-xs text-[#fe6201] hover:underline font-medium mt-1"
                  >
                    Change image
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={handleRemoveImage}
                  className="w-7 h-7 rounded-md text-[#4B5563] hover:text-[#EF4444]"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {validationError && (
            <p className="text-xs text-[#EF4444] bg-[#EF4444]/10 p-2.5 rounded-md border border-[#EF4444]/20">
              {validationError}
            </p>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 rounded-md bg-[#fe6201] hover:bg-[#e55801] text-white font-medium text-sm transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Updating...</span>
              </>
            ) : (
              "Update"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCategoryDialog;
