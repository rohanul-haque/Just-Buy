import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/api/client";
import categoryService from "@/api/services/category.service";
import productService from "@/api/services/product.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { ICategory } from "@/types/category";
import type { IProduct } from "@/types/product";

const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL"] as const;

interface FeatureImageState {
  preview: string;
  file?: File;
  isExisting?: boolean;
  publicId?: string;
  name?: string;
}

interface GalleryItemState {
  id: string;
  preview: string;
  name: string;
  file?: File;
  isExisting?: boolean;
  publicId?: string;
}

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

  // 1. Single Feature Image State
  const [featureImage, setFeatureImage] = useState<FeatureImageState | null>(null);

  // 2. Multiple Gallery Images State
  const [galleryItems, setGalleryItems] = useState<GalleryItemState[]>([]);
  const [removedPublicIds, setRemovedPublicIds] = useState<string[]>([]);

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

          // Populate existing feature image
          if (prod.featureImage?.url) {
            setFeatureImage({
              preview: prod.featureImage.url,
              isExisting: true,
              publicId: prod.featureImage.publicId,
              name: "Feature Image",
            });
          }

          // Populate existing gallery images
          if (prod.images && prod.images.length > 0) {
            const items: GalleryItemState[] = prod.images.map((img, idx) => ({
              id: `existing-${idx}`,
              preview: img.url,
              name: `Gallery Image #${idx + 1}`,
              isExisting: true,
              publicId: img.publicId,
            }));
            setGalleryItems(items);
          }
        } else {
          setLoadError(productRes.message || "Failed to load product details.");
        }
      } catch (err) {
        setLoadError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Feature Image change
  const handleFeatureImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (featureImage?.isExisting && featureImage.publicId) {
        setRemovedPublicIds((prev) => [...prev, featureImage.publicId!]);
      }
      setFeatureImage({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        isExisting: false,
      });
    }
    e.target.value = "";
  };

  const removeFeatureImage = () => {
    if (featureImage?.isExisting && featureImage.publicId) {
      setRemovedPublicIds((prev) => [...prev, featureImage.publicId!]);
    }
    setFeatureImage(null);
  };

  // Gallery Images change
  const handleGalleryFilesAdded = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems: GalleryItemState[] = files.map((file, idx) => ({
      id: `new-${Date.now()}-${idx}`,
      name: file.name,
      preview: URL.createObjectURL(file),
      file,
      isExisting: false,
    }));

    setGalleryItems((prev) => [...prev, ...newItems].slice(0, 10));
    e.target.value = "";
  };

  const removeGalleryItem = (index: number) => {
    const target = galleryItems[index];
    if (target.isExisting && target.publicId) {
      setRemovedPublicIds((prev) => [...prev, target.publicId!]);
    }
    setGalleryItems((prev) => prev.filter((_, idx) => idx !== index));
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
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      toast.error("Please enter a valid regular price.");
      return;
    }
    const numStock = parseInt(stock, 10);
    if (isNaN(numStock) || numStock < 0) {
      toast.error("Please enter a valid stock quantity.");
      return;
    }
    if (!featureImage) {
      toast.error("Please upload or retain a feature image.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("category", categoryId);
      formData.append("price", String(numPrice));
      formData.append("stock", String(numStock));
      if (brand.trim()) formData.append("brand", brand.trim());
      if (description.trim()) formData.append("description", description.trim());
      formData.append("isActive", String(isActive));

      selectedSizes.forEach((s) => {
        formData.append("sizes", s);
      });

      // New feature image
      if (featureImage.file) {
        formData.append("featureImage", featureImage.file);
      }

      // New gallery images
      galleryItems.forEach((item) => {
        if (item.file) {
          formData.append("images", item.file);
        }
      });

      // Removed images
      removedPublicIds.forEach((pid) => {
        formData.append("removedImages", pid);
      });

      const response = await productService.updateMyProduct(productId, formData);
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
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full" />
          <Skeleton className="h-8 w-56" />
        </div>
        <div className="rounded-2xl border border-[#ffceb0]/80 bg-[#FFE7D9] p-8 space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <h3 className="text-lg font-bold text-[#DC2626]">Failed to load product</h3>
        <p className="text-sm text-[#4B5563]">{loadError}</p>
        <Button onClick={() => navigate("/products")} className="bg-[#fe6201] text-white">
          Return to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/products")}
          className="h-9 w-9 rounded-full text-[#1F2937] hover:bg-[#ffceb0]/40"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-[#1F2937] tracking-tight">
          Edit Product Details
        </h1>
      </div>

      {/* Main Container Card */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-[#ffceb0]/80 bg-[#FFE7D9] p-6 sm:p-8 shadow-xs space-y-6 text-[#1F2937]">
        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Fields */}
          <div className="lg:col-span-6 space-y-4">
            {/* 1. Product Name */}
            <div className="space-y-1.5">
              <label htmlFor="edit-p-name" className="text-sm font-bold text-[#1F2937] block">
                Product Name
              </label>
              <Input
                id="edit-p-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Lorem Ipsum"
                required
                className="h-11 px-4 rounded-xl bg-transparent border border-[#9CA3AF] text-sm text-[#1F2937] placeholder:text-[#6B7280] shadow-2xs focus-visible:ring-0 focus-visible:border-[#fe6201]"
              />
            </div>

            {/* 2. Description */}
            <div className="space-y-1.5">
              <label htmlFor="edit-p-desc" className="text-sm font-bold text-[#1F2937] block">
                Description
              </label>
              <Textarea
                id="edit-p-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Lorem Ipsum Is A Dummy Text"
                className="px-4 py-2.5 rounded-xl bg-transparent border border-[#9CA3AF] text-sm text-[#1F2937] placeholder:text-[#6B7280] shadow-2xs focus-visible:ring-0 focus-visible:border-[#fe6201]"
              />
            </div>

            {/* 3. Category */}
            <div className="space-y-1.5">
              <label htmlFor="edit-p-cat" className="text-sm font-bold text-[#1F2937] block">
                Category
              </label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="edit-p-cat" className="h-11 px-4 rounded-xl bg-transparent border border-[#9CA3AF] text-sm text-[#1F2937] shadow-2xs focus:ring-[#fe6201]">
                  <SelectValue placeholder="Sneaker" />
                </SelectTrigger>
                <SelectContent className="bg-[#FFE7D9] border border-[#ffceb0]/80">
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id} className="text-sm cursor-pointer hover:bg-[#ffceb0]/60">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 4. Brand Name */}
            <div className="space-y-1.5">
              <label htmlFor="edit-p-brand" className="text-sm font-bold text-[#1F2937] block">
                Brand Name
              </label>
              <Input
                id="edit-p-brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Addidas"
                className="h-11 px-4 rounded-xl bg-transparent border border-[#9CA3AF] text-sm text-[#1F2937] placeholder:text-[#6B7280] shadow-2xs focus-visible:ring-0 focus-visible:border-[#fe6201]"
              />
            </div>

            {/* 5. Stock Quantity */}
            <div className="space-y-1.5">
              <label htmlFor="edit-p-stock" className="text-sm font-bold text-[#1F2937] block">
                Stock Quantity
              </label>
              <Input
                id="edit-p-stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="211"
                required
                className="h-11 px-4 rounded-xl bg-transparent border border-[#9CA3AF] text-sm text-[#1F2937] placeholder:text-[#6B7280] shadow-2xs focus-visible:ring-0 focus-visible:border-[#fe6201]"
              />
            </div>

            {/* 6. Regular Price */}
            <div className="space-y-1.5">
              <label htmlFor="edit-p-price" className="text-sm font-bold text-[#1F2937] block">
                Regular Price
              </label>
              <Input
                id="edit-p-price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="$110.40"
                required
                className="h-11 px-4 rounded-xl bg-transparent border border-[#9CA3AF] text-sm text-[#1F2937] placeholder:text-[#6B7280] shadow-2xs focus-visible:ring-0 focus-visible:border-[#fe6201]"
              />
            </div>

            {/* 7. Size (Optional) */}
            <div className="space-y-2 pt-1">
              <label className="text-sm font-bold text-[#1F2937] block">
                Size(Optional)
              </label>
              <div className="flex items-center gap-2">
                {AVAILABLE_SIZES.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={`min-w-10 h-10 px-3 rounded-lg border text-sm font-medium transition-all cursor-pointer shadow-2xs ${
                        isSelected
                          ? "bg-white border-[#fe6201] text-[#fe6201] font-bold ring-1 ring-[#fe6201]"
                          : "bg-white/80 border-[#9CA3AF] text-[#1F2937] hover:bg-white"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Two distinct sections: Feature Image & Gallery Images */}
          <div className="lg:col-span-6 space-y-6">
            {/* Section 1: Single Feature Image */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#1F2937]">
                  Feature Image <span className="text-[#fe6201]">*</span>
                </h3>
                <span className="text-xs text-[#6B7280]">Primary single photo</span>
              </div>

              {!featureImage ? (
                <label className="border-2 border-dashed border-[#9CA3AF] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#fe6201] bg-transparent transition-colors min-h-[140px] select-none">
                  <ImageIcon className="w-10 h-10 text-[#1F2937] stroke-[1.2] mb-1.5" />
                  <p className="text-xs sm:text-sm text-[#4B5563] font-medium">
                    Upload Feature Image, or <span className="text-[#fe6201] underline">browse</span>
                  </p>
                  <span className="text-[11px] text-[#6B7280] mt-0.5">
                    Single main image (Jpeg, png)
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFeatureImageChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="rounded-xl border border-[#9CA3AF] bg-transparent p-3 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-14 h-14 rounded-lg bg-[#9CA3AF]/40 overflow-hidden shrink-0 flex items-center justify-center">
                      <img
                        src={featureImage.preview}
                        alt="Feature Image"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-[#1F2937] truncate">
                        {featureImage.name || "Feature Image"}
                      </p>
                      <span className="text-[10px] font-bold text-[#fe6201] uppercase block mt-0.5">
                        Feature Image
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={removeFeatureImage}
                    className="p-1.5 text-[#1F2937] hover:text-[#DC2626] transition-colors cursor-pointer shrink-0"
                    title="Remove feature image"
                    aria-label="Remove feature image"
                  >
                    <Trash2 className="w-5 h-5 stroke-[1.5]" />
                  </button>
                </div>
              )}
            </div>

            {/* Section 2: Multiple Gallery Images */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#1F2937]">
                  Product Gallery Images
                </h3>
                <span className="text-xs text-[#6B7280]">Multiple images</span>
              </div>

              {/* Upload Dropzone for multiple images */}
              <label className="border-2 border-dashed border-[#9CA3AF] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#fe6201] bg-transparent transition-colors min-h-[140px] select-none">
                <ImageIcon className="w-10 h-10 text-[#1F2937] stroke-[1.2] mb-1.5" />
                <p className="text-xs sm:text-sm text-[#4B5563] font-medium">
                  Drop gallery images here, or <span className="text-[#fe6201] underline">browse</span>
                </p>
                <span className="text-[11px] text-[#6B7280] mt-0.5">
                  Select multiple product photos (Jpeg, png)
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={handleGalleryFilesAdded}
                  className="hidden"
                />
              </label>

              {/* Uploaded Gallery Images List */}
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {galleryItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-[#9CA3AF] bg-transparent p-3 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-[#9CA3AF]/40 overflow-hidden shrink-0 flex items-center justify-center">
                        <img
                          src={item.preview}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-[#1F2937] truncate">
                          {item.name}
                        </p>
                        <span className="text-[10px] text-[#6B7280] block">
                          Gallery Image #{idx + 1}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeGalleryItem(idx)}
                      className="p-1.5 text-[#1F2937] hover:text-[#DC2626] transition-colors cursor-pointer shrink-0"
                      title="Remove image"
                      aria-label="Remove image"
                    >
                      <Trash2 className="w-5 h-5 stroke-[1.5]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-[#fe6201] hover:bg-[#e55801] text-white font-bold text-sm uppercase tracking-wider shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </span>
            ) : (
              "Update Product"
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/products")}
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-transparent border-2 border-[#fe6201] text-[#fe6201] hover:bg-[#fe6201]/10 font-bold text-sm uppercase tracking-wider cursor-pointer"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;
