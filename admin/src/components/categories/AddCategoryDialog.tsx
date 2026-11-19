import React, { useRef, useState } from "react";
import { ArrowLeft, Upload, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import categoryService from "@/api/services/category.service";
import { getApiErrorMessage } from "@/api/client";
import { toast } from "sonner";

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setValidationError("Please select a valid image file (JPEG, PNG, WEBP).");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setValidationError(null);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", trimmed);
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      await categoryService.createCategory(formData);
      toast.success("Category created successfully!");
      handleClose();
      onSuccess();
    } catch (error) {
      const message = getApiErrorMessage(error);
      setValidationError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    handleRemoveImage();
    setValidationError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-7 bg-white rounded-[16px] border border-[#E5E7EB] shadow-lg overflow-hidden font-sans">
        <DialogTitle className="sr-only">Add new category</DialogTitle>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-full text-[#1F2937] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-[#0F172A]">
            Add new category
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Name */}
          <div className="space-y-2">
            <label
              htmlFor="category-name"
              className="text-sm font-medium text-[#111827] block"
            >
              Category name
            </label>
            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="Enter category name"
              disabled={isSubmitting}
              className="w-full px-4 py-2 rounded-full border border-[#E5E7EB] bg-white text-[#0F172A] placeholder:text-[#4B5563] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition text-base"
            />
          </div>

          {/* Upload Category Image */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#111827] block">
              Upload category Image
            </label>

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
                className="w-full border-2 border-dashed border-[#E5E7EB] bg-[#F8FAFC] rounded-[16px] p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#F1F5F9] transition-colors"
              >
                <div className="p-2.5 rounded-full bg-white border border-[#E5E7EB] text-[#4F46E5]">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-[#111827]">
                  Upload image
                </span>
                <span className="text-xs text-[#4B5563]">
                  PNG, JPG or WEBP (up to 5MB)
                </span>
              </div>
            ) : (
              <div className="relative border border-[#E5E7EB] rounded-[16px] p-2 bg-white flex items-center gap-3">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-[8px] flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#0F172A] truncate">
                    {selectedFile?.name}
                  </p>
                  <p className="text-[11px] text-[#4B5563]">
                    {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : ""}
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-[#4F46E5] hover:underline font-medium mt-1 cursor-pointer"
                  >
                    Change image
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-1 rounded-full text-[#4B5563] hover:text-[#EF4444] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {validationError && (
            <p className="text-xs text-[#EF4444] bg-[#EF4444]/10 p-2.5 rounded-full border border-[#EF4444]/20">
              {validationError}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 py-2 px-5 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              "Add Category"
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;
