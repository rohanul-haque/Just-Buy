import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/api/client";
import categoryService from "@/api/services/category.service";
import productService from "@/api/services/product.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ICategory } from "@/types/category";

const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL"] as const;

export const AddProductPage: React.FC = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // Image Upload State
  const [featureImage, setFeatureImage] = useState<File | null>(null);
  const [featureImagePreview, setFeatureImagePreview] = useState<string | null>(
    null,
  );
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        if (response.success && response.data) {
          const activeOnly = response.data.filter(
            (c) => c.isActive !== false,
          );
          setCategories(activeOnly);
          if (activeOnly.length > 0) {
            setCategoryId(activeOnly[0]._id);
          }
        }
      } catch (err) {
        toast.error("Failed to load categories: " + getApiErrorMessage(err));
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  const handleFeatureImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeatureImage(file);
      setFeatureImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdditionalImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAdditionalImages((prev) => [...prev, ...files].slice(0, 10));
      const newPreviews = files.map((f) => URL.createObjectURL(f));
      setAdditionalPreviews((prev) => [...prev, ...newPreviews].slice(0, 10));
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Product name is required.");
      return;
    }
    if (!categoryId) {
      toast.error("Please select a category.");
      return;
    }
    if (!price || Number(price) <= 0) {
      toast.error("Please enter a valid price greater than zero.");
      return;
    }
    if (stock === "" || Number(stock) < 0) {
      toast.error("Please enter a valid non-negative stock count.");
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      toast.error("Product description must be at least 5 characters.");
      return;
    }
    if (!featureImage) {
      toast.error("Please upload a main product image.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("category", categoryId);
      formData.append("price", String(Number(price)));
      formData.append("stock", String(Math.floor(Number(stock))));
      formData.append("description", description.trim());
      if (brand.trim()) {
        formData.append("brand", brand.trim());
      }
      if (selectedSizes.length > 0) {
        formData.append("sizes", JSON.stringify(selectedSizes));
      }

      // Append images
      formData.append("featureImage", featureImage);
      additionalImages.forEach((img) => {
        formData.append("images", img);
      });

      const response = await productService.createProduct(formData);
      if (response.success) {
        toast.success("Product created successfully!");
        navigate("/products");
      } else {
        toast.error(response.message || "Failed to create product.");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/products")}
          className="h-9 w-9 p-0 border-[#E5E7EB] text-[#374151] hover:bg-[#F8FAFC]"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A]">Add New Product</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Fill in the details below to publish a product to your store.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <Card className="border border-[#E5E7EB] bg-white rounded-lg shadow-xs">
          <CardHeader className="pb-3 border-b border-[#F1F5F9]">
            <CardTitle className="text-base font-bold text-[#0F172A]">
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Name */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="name" className="text-xs font-semibold text-[#374151]">
                  Product Name <span className="text-[#EF4444]">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Classic Cotton Crewneck T-Shirt"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-10 text-sm border-[#E5E7EB]"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-semibold text-[#374151]">
                  Category <span className="text-[#EF4444]">*</span>
                </Label>
                {isLoadingCategories ? (
                  <div className="h-10 flex items-center px-3 border border-[#E5E7EB] rounded-md text-xs text-[#94A3B8]">
                    Loading categories...
                  </div>
                ) : (
                  <Select
                    value={categoryId}
                    onValueChange={(val) => setCategoryId(val)}
                  >
                    <SelectTrigger id="category" className="w-full h-10 text-sm text-[#0F172A] border-[#E5E7EB] bg-white">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id} className="text-sm">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Brand */}
              <div className="space-y-1.5">
                <Label htmlFor="brand" className="text-xs font-semibold text-[#374151]">
                  Brand Name (Optional)
                </Label>
                <Input
                  id="brand"
                  placeholder="e.g. Jus Buy Basics"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="h-10 text-sm border-[#E5E7EB]"
                />
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-xs font-semibold text-[#374151]">
                  Price (৳) <span className="text-[#EF4444]">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="h-10 text-sm border-[#E5E7EB]"
                />
              </div>

              {/* Stock */}
              <div className="space-y-1.5">
                <Label htmlFor="stock" className="text-xs font-semibold text-[#374151]">
                  Initial Stock Inventory <span className="text-[#EF4444]">*</span>
                </Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  className="h-10 text-sm border-[#E5E7EB]"
                />
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-2 pt-2">
              <Label className="text-xs font-semibold text-[#374151]">
                Available Sizes (Optional)
              </Label>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                {AVAILABLE_SIZES.map((size) => {
                  const isChecked = selectedSizes.includes(size);
                  return (
                    <div key={size} className="flex items-center space-x-2">
                      <Checkbox
                        id={`add-size-${size}`}
                        checked={isChecked}
                        onCheckedChange={() => handleSizeToggle(size)}
                      />
                      <label
                        htmlFor={`add-size-${size}`}
                        className="text-xs font-medium text-[#374151] cursor-pointer select-none"
                      >
                        {size}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 pt-2">
              <Label htmlFor="description" className="text-xs font-semibold text-[#374151]">
                Product Description <span className="text-[#EF4444]">*</span>
              </Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Provide a detailed description of features, materials, and care instructions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="text-sm border-[#E5E7EB]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Media Card */}
        <Card className="border border-[#E5E7EB] bg-white rounded-lg shadow-xs">
          <CardHeader className="pb-3 border-b border-[#F1F5F9]">
            <CardTitle className="text-base font-bold text-[#0F172A]">
              Product Images
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Main Feature Image */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-[#374151]">
                Main Feature Image <span className="text-[#EF4444]">*</span>
              </Label>
              <div className="flex items-center gap-4">
                {featureImagePreview ? (
                  <div className="w-24 h-24 rounded-md border border-[#E5E7EB] overflow-hidden relative group">
                    <img
                      src={featureImagePreview}
                      alt="Feature preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFeatureImage(null);
                        setFeatureImagePreview(null);
                      }}
                      className="absolute top-1 right-1 p-1 bg-[#EF4444] text-white rounded-full opacity-90 hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="w-24 h-24 rounded-md border-2 border-dashed border-[#CBD5E1] hover:border-[#6366F1] flex flex-col items-center justify-center cursor-pointer bg-[#F8FAFC] transition-colors">
                    <Upload className="w-6 h-6 text-[#94A3B8]" />
                    <span className="text-[10px] text-[#64748B] mt-1 font-medium">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFeatureImageChange}
                      className="hidden"
                    />
                  </label>
                )}
                <div className="text-xs text-[#64748B]">
                  <p className="font-semibold text-[#0F172A]">Primary Showcase Photo</p>
                  <p>PNG, JPG, or WEBP. Square ratio recommended.</p>
                </div>
              </div>
            </div>

            {/* Additional Images */}
            <div className="space-y-2 pt-2 border-t border-[#F1F5F9]">
              <Label className="text-xs font-semibold text-[#374151]">
                Additional Images (Up to 10 photos)
              </Label>
              <div className="flex flex-wrap gap-3">
                {additionalPreviews.map((preview, idx) => (
                  <div
                    key={idx}
                    className="w-20 h-20 rounded-md border border-[#E5E7EB] overflow-hidden relative group"
                  >
                    <img
                      src={preview}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeAdditionalImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-[#EF4444] text-white rounded-full opacity-90 hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {additionalImages.length < 10 && (
                  <label className="w-20 h-20 rounded-md border-2 border-dashed border-[#CBD5E1] hover:border-[#6366F1] flex flex-col items-center justify-center cursor-pointer bg-[#F8FAFC] transition-colors">
                    <Upload className="w-5 h-5 text-[#94A3B8]" />
                    <span className="text-[10px] text-[#64748B] mt-1 font-medium">+ Add</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleAdditionalImagesChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/products")}
            disabled={isSubmitting}
            className="border-[#E5E7EB] text-[#374151]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold px-6 shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing Product...
              </>
            ) : (
              "Publish Product"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;
