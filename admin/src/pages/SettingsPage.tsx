import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import type { ProfileActionResult } from "@/routes/actions/profile.action";
import type { ProfileLoaderData } from "@/routes/loaders/profile.loader";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useFetcher, useLoaderData, useNavigate } from "react-router";
import { toast } from "sonner";

export const SettingsPage: React.FC = () => {
  const loaderData = useLoaderData() as ProfileLoaderData | undefined;
  const { user, adminProfile, refreshProfile } = useAuth();
  const fetcher = useFetcher<ProfileActionResult>();
  const navigate = useNavigate();

  const currentUser = loaderData?.user || user;
  const currentProfile = loaderData?.adminProfile || adminProfile;

  const initialName = currentProfile?.admin?.name || currentUser?.name || "James Tracy";
  const initialEmail = currentProfile?.admin?.email || currentUser?.email || "enrique@gmail.com";
  const initialPhone = currentProfile?.phoneNumber || "3000597212";
  const initialAvatarUrl = currentProfile?.profile?.url || null;

  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialAvatarUrl);
  const [password, setPassword] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSaving =
    fetcher.state === "submitting" || fetcher.state === "loading";

  useEffect(() => {
    if (currentProfile?.admin?.name || currentUser?.name) {
      setName(currentProfile?.admin?.name || currentUser?.name || "");
    }
    if (currentProfile?.phoneNumber) {
      setPhone(currentProfile?.phoneNumber);
    }
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
        setPassword("");
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

    const trimmedPassword = password.trim();
    if (trimmedPassword) {
      if (trimmedPassword.length < 6) {
        toast.error("Password must be at least 6 characters.");
        return;
      }
      formData.append("password", trimmedPassword);
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

  return (
    <div className="space-y-8 max-w-5xl">
      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Top Action Header: Left arrow + Title, Right Save Changes Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-[#1F2937] hover:opacity-80 p-1 transition-opacity cursor-pointer"
              title="Go back"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] tracking-tight">
              Personal Information
            </h2>
          </div>

          <Button
            type="submit"
            disabled={isSaving}
            className="h-11 px-8 rounded-md bg-[#FE6201] hover:bg-[#E55801] text-white font-medium text-sm transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>

        {/* Main Content Layout: Left Profile Card, Right Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left: Profile Card (Rounded Peach-Orange Box) */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-8 sm:p-10 rounded-xl border border-[#ffceb0]/80 bg-[#FFE7D9] shadow-xs text-center space-y-4 min-h-[340px]">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-[#FE6201]/30 shadow-xs flex items-center justify-center bg-black/10 relative">
                <ProfileAvatar
                  src={previewUrl}
                  alt={name || "Admin"}
                  className="w-full h-full object-cover"
                />
                {/* Camera Overlay Icon */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-80 group-hover:opacity-100 transition-opacity">
                  <div className="flex flex-col items-center">
                    <Camera className="w-7 h-7 stroke-[1.8]" />
                  </div>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-normal text-[#6B7280] block">
                Profile
              </span>
              <h3 className="text-xl font-bold text-[#1F2937]">
                Admin
              </h3>
            </div>
          </div>

          {/* Right: Form Inputs (Name, Email, Phone Number with Flag Country Code) */}
          <div className="md:col-span-8 space-y-6">
            {/* 1. Name */}
            <div className="space-y-2">
              <label
                htmlFor="admin-name"
                className="text-sm font-semibold text-[#1F2937] block"
              >
                Name
              </label>
              <Input
                id="admin-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                disabled={isSaving}
                className="h-12 px-4 rounded-xl bg-[#FFE7D9] border border-[#ffceb0]/80 text-[#1F2937] text-sm focus-visible:ring-1 focus-visible:ring-[#fe6201] focus-visible:border-[#fe6201] shadow-xs"
              />
            </div>

            {/* 2. Email */}
            <div className="space-y-2">
              <label
                htmlFor="admin-email"
                className="text-sm font-semibold text-[#1F2937] block"
              >
                Email
              </label>
              <Input
                id="admin-email"
                type="email"
                value={initialEmail}
                readOnly
                disabled
                className="h-12 px-4 rounded-xl bg-[#FFE7D9] border border-[#ffceb0]/80 text-[#1F2937] text-sm shadow-xs cursor-not-allowed opacity-90"
              />
            </div>

            {/* 3. Phone Number */}
            <div className="space-y-2">
              <label
                htmlFor="admin-phone"
                className="text-sm font-semibold text-[#1F2937] block"
              >
                Phone Number
              </label>
              <Input
                id="admin-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                disabled={isSaving}
                className="w-full h-12 px-4 rounded-xl bg-[#FFE7D9] border border-[#ffceb0]/80 text-[#1F2937] text-sm focus-visible:ring-1 focus-visible:ring-[#fe6201] focus-visible:border-[#fe6201] shadow-xs"
              />
            </div>

            {/* 4. Password (Optional) */}
            <div className="space-y-2">
              <label
                htmlFor="admin-password"
                className="text-sm font-semibold text-[#1F2937] block"
              >
                Password
              </label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password (optional)"
                disabled={isSaving}
                className="w-full h-12 px-4 rounded-xl bg-[#FFE7D9] border border-[#ffceb0]/80 text-[#1F2937] text-sm focus-visible:ring-1 focus-visible:ring-[#fe6201] focus-visible:border-[#fe6201] shadow-xs"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
