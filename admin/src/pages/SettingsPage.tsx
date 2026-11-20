import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import type { ProfileActionResult } from "@/routes/actions/profile.action";
import type { ProfileLoaderData } from "@/routes/loaders/profile.loader";
import { Camera, Loader2, Mail, Phone, Save, User } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { toast } from "sonner";

export const SettingsPage: React.FC = () => {
  const loaderData = useLoaderData() as ProfileLoaderData | undefined;
  const { user, adminProfile, refreshProfile } = useAuth();
  const fetcher = useFetcher<ProfileActionResult>();

  const currentUser = loaderData?.user || user;
  const currentProfile = loaderData?.adminProfile || adminProfile;

  const initialName =
    currentProfile?.admin?.name || currentUser?.name || "";
  const initialEmail =
    currentProfile?.admin?.email || currentUser?.email || "";
  const initialPhone = currentProfile?.phoneNumber || "";
  const initialAvatarUrl = currentProfile?.profile?.url || null;

  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialAvatarUrl);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSaving =
    fetcher.state === "submitting" || fetcher.state === "loading";

  useEffect(() => {
    setName(currentProfile?.admin?.name || currentUser?.name || "");
    setPhone(currentProfile?.phoneNumber || "");
    if (!selectedFile) {
      setPreviewUrl(currentProfile?.profile?.url || null);
    }
  }, [currentProfile, currentUser, selectedFile]);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        toast.success(
          fetcher.data.message || "Admin profile updated successfully!",
        );
        refreshProfile();
        setSelectedFile(null);
      } else if (fetcher.data.error) {
        toast.error(fetcher.data.error);
      }
    }
  }, [fetcher.data, refreshProfile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file (JPEG, PNG, WEBP).");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    let hasChanges = false;

    // Partial updates: only append fields that the admin actually provided/changed
    const trimmedName = name.trim();
    if (trimmedName && trimmedName !== initialName) {
      formData.append("name", trimmedName);
      hasChanges = true;
    }

    const trimmedPhone = phone.trim();
    if (trimmedPhone !== initialPhone) {
      formData.append("phoneNumber", trimmedPhone);
      hasChanges = true;
    }

    if (selectedFile) {
      formData.append("profile", selectedFile);
      hasChanges = true;
    }

    if (!hasChanges) {
      toast.info("No profile changes detected.");
      return;
    }

    fetcher.submit(formData, {
      method: "post",
      action: "/settings",
      encType: "multipart/form-data",
    });
  };

  const displayName = name || initialName || "Administrator";
  const displayEmail = initialEmail || "admin@jusbuy.com";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
          Admin Settings
        </h2>
        <p className="text-sm text-[#4B5563] mt-1 font-normal">
          Manage your personal profile and account credentials.
        </p>
      </div>

      {/* Admin Profile Card (shadcn Card with MD rounded corners) */}
      <Card className="rounded-md p-6 md:p-8 border-[#E5E7EB] bg-white space-y-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-4">
          <User className="w-5 h-5 text-[#4F46E5]" />
          <h3 className="text-base font-bold text-[#0F172A]">
            Personal Profile
          </h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar className="w-24 h-24 rounded-md border-2 border-[#E5E7EB]">
                {previewUrl ? (
                  <AvatarImage
                    src={previewUrl}
                    alt={displayName}
                    className="rounded-md object-cover"
                  />
                ) : null}
                <AvatarFallback className="bg-[#E0E7FF] text-[#4F46E5] text-3xl font-bold rounded-md">
                  {displayName[0]?.toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSaving}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-md bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-sm cursor-pointer"
                title="Change photo"
              >
                <Camera className="w-4 h-4" />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
              />
            </div>

            <div className="text-center sm:text-left space-y-1">
              <h4 className="text-lg font-bold text-[#0F172A]">{displayName}</h4>
              <p className="text-sm text-[#4B5563]">{displayEmail}</p>
            </div>
          </div>

          {/* Form Fields: exactly 3 fields (Full Name, Email Address, Phone Number) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Full Name (Editable) */}
            <div className="space-y-2">
              <label
                htmlFor="admin-name"
                className="text-xs font-semibold text-[#111827] block"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#4B5563] absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="admin-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  disabled={isSaving}
                  className="pl-9 h-10 rounded-md bg-white border-[#E5E7EB] text-[#0F172A] text-sm focus:ring-[#4F46E5]/30 focus:border-[#4F46E5]"
                />
              </div>
            </div>

            {/* 2. Email Address (Display current email, protected by security requirements) */}
            <div className="space-y-2">
              <label
                htmlFor="admin-email"
                className="text-xs font-semibold text-[#111827] block"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#4B5563] absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="admin-email"
                  type="email"
                  value={displayEmail}
                  disabled
                  className="pl-9 h-10 rounded-md bg-[#F8FAFC] border-[#E5E7EB] text-[#4B5563] text-sm cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-[#4B5563]">
                Primary email associated with administrator credentials
              </p>
            </div>

            {/* 3. Phone Number (Editable) */}
            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="admin-phone"
                className="text-xs font-semibold text-[#111827] block"
              >
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#4B5563] absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="admin-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 234 567 8900"
                  disabled={isSaving}
                  className="pl-9 h-10 rounded-md bg-white border-[#E5E7EB] text-[#0F172A] text-sm focus:ring-[#4F46E5]/30 focus:border-[#4F46E5]"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="h-10 px-6 rounded-md bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium text-sm transition flex items-center justify-center cursor-pointer shadow-xs"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SettingsPage;
