import React, { useRef, useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Camera,
  Loader2,
  Server,
  Save,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import authService from "@/api/services/auth.service";
import { getApiErrorMessage } from "@/api/client";
import { toast } from "sonner";

export const SettingsPage: React.FC = () => {
  const { user, adminProfile, refreshProfile } = useAuth();

  const [phone, setPhone] = useState(adminProfile?.phoneNumber || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    adminProfile?.profile?.url || null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adminProfile) {
      setPhone(adminProfile.phoneNumber || "");
      if (!selectedFile) {
        setPreviewUrl(adminProfile.profile?.url || null);
      }
    }
  }, [adminProfile, selectedFile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file.");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("phoneNumber", phone.trim());
      if (selectedFile) {
        formData.append("profile", selectedFile);
      }

      await authService.updateAdminProfile(formData);
      await refreshProfile();
      toast.success("Admin profile updated successfully!");
      setSelectedFile(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const displayName =
    adminProfile?.admin?.name ||
    (adminProfile as any)?.name ||
    user?.name ||
    "Platform Admin";
  const displayEmail =
    adminProfile?.admin?.email ||
    (adminProfile as any)?.email ||
    user?.email ||
    "admin@jusbuy.com";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
          Admin Settings
        </h2>
        <p className="text-sm text-[#4B5563] mt-1 font-normal">
          Manage your administrator profile, personal information, and platform configuration.
        </p>
      </div>

      {/* Admin Profile Card */}
      <div className="bg-white rounded-[16px] p-6 md:p-[28px] border border-[#E5E7EB] space-y-6">
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
              <div className="w-24 h-24 rounded-full overflow-hidden bg-[#F8FAFC] border-2 border-[#E5E7EB] flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-[#4F46E5]">
                    {displayName[0]?.toUpperCase() || "A"}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-full shadow-sm transition cursor-pointer"
                title="Change photo"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="text-center sm:text-left space-y-1">
              <h4 className="text-lg font-bold text-[#0F172A]">{displayName}</h4>
              <p className="text-sm text-[#4B5563]">{displayEmail}</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0E7FF] text-[#4F46E5] text-xs font-semibold mt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Super Administrator</span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#111827] block">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#4B5563] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={displayName}
                  disabled
                  className="w-full pl-11 pr-4 py-2 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] text-[#4B5563] text-sm cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-[#4B5563]">
                Created during admin account initialization
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#111827] block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#4B5563] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={displayEmail}
                  disabled
                  className="w-full pl-11 pr-4 py-2 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] text-[#4B5563] text-sm cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-[#4B5563]">
                Primary credentials for admin login
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="admin-phone"
                className="text-xs font-semibold text-[#111827] block"
              >
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#4B5563] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 234 567 8900"
                  className="w-full pl-11 pr-4 py-2 rounded-full bg-white border border-[#E5E7EB] text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#111827] block">
                Assigned Role
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-[#4B5563] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value="admin"
                  disabled
                  className="w-full pl-11 pr-4 py-2 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] text-[#4B5563] text-sm cursor-not-allowed font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="h-10 flex items-center gap-2 px-6 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium text-sm transition disabled:opacity-60 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Platform Information Card */}
      <div className="bg-white rounded-[16px] p-6 md:p-[28px] border border-[#E5E7EB] space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-4">
          <Server className="w-5 h-5 text-[#4F46E5]" />
          <h3 className="text-base font-bold text-[#0F172A]">
            System & Environment
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB]">
            <span className="text-[#4B5563] font-medium block">API Gateway</span>
            <span className="font-mono text-[#0F172A] font-semibold mt-1 block truncate">
              {import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1"}
            </span>
          </div>

          <div className="p-4 rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB]">
            <span className="text-[#4B5563] font-medium block">API Status</span>
            <div className="flex items-center gap-1.5 text-[#4F46E5] font-semibold mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Connected</span>
            </div>
          </div>

          <div className="p-4 rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB]">
            <span className="text-[#4B5563] font-medium block">Default Commission</span>
            <span className="font-semibold text-[#0F172A] mt-1 block">
              10% Platform Cut
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
