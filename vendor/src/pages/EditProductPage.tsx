import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Loader2, Package, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/api/client";
import categoryService from "@/api/services/category.service";
import productService from "@/api/services/product.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { ICategory } from "@/types/category";
import type { IProduct } from "@/types/product";

const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL"] as const;

export const EditProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  // Existing images from database
  const [existingFeatureImageUrl, setExistingFeatureImageUrl] = useState<
    string | null
  >(null);
  const [existingImages, setExistingImages] = useState<
    Array<{ publicId: string; url: string }>
  >([]);

  // New Image Uploads (replacement / addition)
  const [newFeatureImage, setNewFeatureImage] = useState<File | null>(null);
  const [newFeatureImagePreview, setNewFeatureImagePreview] = useState<
    string | null
  >(null);
  const [newAdditionalImages, setNewAdditionalImages] = useState<File[]>([]);
  const [newAdditionalPreviews, setNewAdditionalPreviews] = useState<string[]>(
    [],
  );

  useEffect(() => {
    if (!productId) {
      setLoadError("Product ID is missing.");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Fetch categories and product concurrently
        const [categoriesRes, productRes] = await Promise.all([
          categoryService.getAllCategories(),
          productService.getProductById(productId),
        ]);

        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data);
        }

        if (productRes.success && productRes.data) {
          const prod: IProduct = productRes.data;
          setName(prod.name || "");
          const catId =
            typeof prod.category === "object" && prod.category?._id
              ? prod.category._id
              : typeof prod.category === "string"
                ? prod.category
                : "";
          setCategoryId(catId);
          setPrice(prod.price !== undefined ? String(prod.price) : "");
          setStock(prod.stock !== undefined ? String(prod.stock) : "");
          setBrand(prod.brand || "");
          setDescription(prod.description || "");
          setSelectedSizes(prod.sizes || []);
          setIsActive(prod.isActive !== false);

          if (prod.featureImage?.url) {
            setExistingFeatureImageUrl(prod.featureImage.url);
          }
          if (prod.images && prod.images.length > 0) {
            setExistingImages(prod.images);
          }
        } else {
          setLoadError("Unable to retrieve product details from backend.");
        }
      } catch (err) {
        const msg = getApiErrorMessage(err);
        setLoadError(msg);
        toast.error("Failed to load product: " + msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [productId]);

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
      setNewFeatureImage(file);
      setNewFeatureImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdditionalImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setNewAdditionalImages((prev) => [...prev, ...files].slice(0, 10));
      const newPreviews = files.map((f) => URL.createObjectURL(f));
      setNewAdditionalPreviews((prev) => [...prev, ...newPreviews].slice(0, 10));
    }
  };

  const removeNewAdditionalImage = (index: number) => {
    setNewAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    setNewAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productId) return;

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

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("category", categoryId);
      formData.append("price", String(Number(price)));
      formData.append("stock", String(Math.floor(Number(stock))));
      formData.append("description", description.trim());
      formData.append("isActive", String(isActive));

      if (brand.trim()) {
        formData.append("brand", brand.trim());
      } else {
        formData.append("brand", "");
      }

      if (selectedSizes.length > 0) {
        formData.append("sizes", JSON.stringify(selectedSizes));
      } else {
        formData.append("sizes", JSON.stringify([]));
      }

      // Append new feature image only if replacement was selected
      if (newFeatureImage) {
        formData.append("featureImage", newFeatureImage);
      }

      // Append any new additional images
      newAdditionalImages.forEach((img) => {
        formData.append("images", img);
      });

      const response = await productService.updateMyProduct(
        productId,
        formData,
      );
      if (response.success) {
        toast.success("Product updated successfully!");
        navigate("/products");
      } else {
        toast.error(response.message || "Failed to update product.");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Card className="border border-[#E5E7EB] bg-white rounded-lg p-6 space-y-4">
          <Skeleton className="h-6 w-36" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-28 w-full" />
        </Card>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#FEF2F2] flex items-center justify-center mx-auto">
          <Package className="w-8 h-8 text-[#EF4444]" />
        </div>
        <h3 className="text-lg font-bold text-[#0F172A]">Unable to Load Product</h3>
        <p className="text-xs text-[#64748B]">{loadError}</p>
        <Button
          onClick={() => navigate("/products")}
          variant="outline"
          className="text-xs border-[#E5E7EB]"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/products")}
          className="h-9 w-9 p-0 border-[#E5E7EB] text-[#374151] hover:bg-[#F8FAFC] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A]">Edit Product</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Update pricing, inventory, description, and photos for this listing.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <Card className="border border-[#E5E7EB] bg-white rounded-lg shadow-xs">
          <CardHeader className="pb-3 border-b border-[#F1F5F9] flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-[#0F172A]">
              Basic Information
            </CardTitle>

            {/* Status Switch / Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#64748B]">Listing Status:</span>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-colors border ${
                  isActive
                    ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                    : "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
                }`}
              >
                {isActive ? "Active (Listed)" : "Inactive (Draft)"}
              </button>
            </div>
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
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-[#E5E7EB] bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
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
                  Available Stock <span className="text-[#EF4444]">*</span>
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
            <div className="space-y-1.5 pt-2">
              <Label className="text-xs font-semibold text-[#374151]">
                Available Sizes (Optional)
              </Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SIZES.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#6366F1] text-white border-[#6366F1]"
                          : "bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      {size}
                    </button>
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
                Main Feature Image
              </Label>
              <div className="flex items-center gap-4">
                {newFeatureImagePreview ? (
                  <div className="w-24 h-24 rounded-md border border-[#E5E7EB] overflow-hidden relative group">
                    <img
                      src={newFeatureImagePreview}
                      alt="New Feature preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setNewFeatureImage(null);
                        setNewFeatureImagePreview(null);
                      }}
                      className="absolute top-1 right-1 p-1 bg-[#EF4444] text-white rounded-full opacity-90 hover:opacity-100"
                      title="Remove replacement photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : existingFeatureImageUrl ? (
                  <div className="w-24 h-24 rounded-md border border-[#E5E7EB] overflow-hidden relative group">
                    <img
                      src={existingFeatureImageUrl}
                      alt="Current Feature"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 py-0.5 rounded">
                      Current
                    </span>
                  </div>
                ) : null}

                <label className="w-24 h-24 rounded-md border-2 border-dashed border-[#CBD5E1] hover:border-[#6366F1] flex flex-col items-center justify-center cursor-pointer bg-[#F8FAFC] transition-colors">
                  <Upload className="w-5 h-5 text-[#94A3B8]" />
                  <span className="text-[10px] text-[#64748B] mt-1 font-medium">
                    {newFeatureImagePreview || existingFeatureImageUrl
                      ? "Replace"
                      : "Upload"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFeatureImageChange}
                    className="hidden"
                  />
                </label>

                <div className="text-xs text-[#64748B]">
                  <p className="font-semibold text-[#0F172A]">Primary Showcase Photo</p>
                  <p>
                    Leave untouched to keep the current image, or select a new
                    photo to replace it.
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Images */}
            <div className="space-y-2 pt-2 border-t border-[#F1F5F9]">
              <Label className="text-xs font-semibold text-[#374151]">
                Additional Images
              </Label>
              <div className="flex flex-wrap gap-3">
                {/* Existing Additional Photos */}
                {existingImages.map((img, idx) => (
                  <div
                    key={`existing-${idx}`}
                    className="w-20 h-20 rounded-md border border-[#E5E7EB] overflow-hidden relative"
                  >
                    <img
                      src={img.url}
                      alt={`Current additional ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1 py-0.5 rounded">
                      Current
                    </span>
                  </div>
                ))}

                {/* Newly Added Additional Photos */}
                {newAdditionalPreviews.map((preview, idx) => (
                  <div
                    key={`new-${idx}`}
                    className="w-20 h-20 rounded-md border border-[#E5E7EB] overflow-hidden relative group"
                  >
                    <img
                      src={preview}
                      alt={`New preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewAdditionalImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-[#EF4444] text-white rounded-full opacity-90 hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {existingImages.length + newAdditionalImages.length < 10 && (
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
                Saving Changes...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;
