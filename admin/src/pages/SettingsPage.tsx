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
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
                  <AvatarImage src={previewUrl} alt={displayName} className="rounded-md object-cover" />
                ) : null}
                <AvatarFallback className="bg-[#E0E7FF] text-[#4F46E5] text-3xl font-bold rounded-md">
                  {displayName[0]?.toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-md bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-sm"
                title="Change photo"
              >
                <Camera className="w-4 h-4" />
              </Button>
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
              <Badge className="bg-[#E0E7FF] text-[#4F46E5] hover:bg-[#E0E7FF] border-none rounded-md px-3 py-1 text-xs font-semibold mt-1">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                <span>Super Administrator</span>
              </Badge>
            </div>
          </div>

          {/* Form Fields (shadcn Input & Label) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#111827] block">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#4B5563] absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  value={displayName}
                  disabled
                  className="pl-9 h-10 rounded-md bg-[#F8FAFC] border-[#E5E7EB] text-[#4B5563] text-sm cursor-not-allowed"
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
                <Mail className="w-4 h-4 text-[#4B5563] absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="email"
                  value={displayEmail}
                  disabled
                  className="pl-9 h-10 rounded-md bg-[#F8FAFC] border-[#E5E7EB] text-[#4B5563] text-sm cursor-not-allowed"
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
                <Phone className="w-4 h-4 text-[#4B5563] absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="admin-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 234 567 8900"
                  className="pl-9 h-10 rounded-md bg-white border-[#E5E7EB] text-[#0F172A] text-sm focus:ring-[#4F46E5]/30 focus:border-[#4F46E5]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#111827] block">
                Assigned Role
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-[#4B5563] absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  value="admin"
                  disabled
                  className="pl-9 h-10 rounded-md bg-[#F8FAFC] border-[#E5E7EB] text-[#4B5563] text-sm cursor-not-allowed font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="h-10 px-6 rounded-md bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium text-sm transition"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>Saving...</span>
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

      {/* Platform Information Card */}
      <Card className="rounded-md p-6 border-[#E5E7EB] bg-white space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-4">
          <Server className="w-5 h-5 text-[#4F46E5]" />
          <h3 className="text-base font-bold text-[#0F172A]">
            System & Environment
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-md bg-[#F8FAFC] border border-[#E5E7EB]">
            <span className="text-[#4B5563] font-medium block">API Gateway</span>
            <span className="font-mono text-[#0F172A] font-semibold mt-1 block truncate">
              {import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1"}
            </span>
          </div>

          <div className="p-4 rounded-md bg-[#F8FAFC] border border-[#E5E7EB]">
            <span className="text-[#4B5563] font-medium block">API Status</span>
            <div className="flex items-center gap-1.5 text-[#4F46E5] font-semibold mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Connected</span>
            </div>
          </div>

          <div className="p-4 rounded-md bg-[#F8FAFC] border border-[#E5E7EB]">
            <span className="text-[#4B5563] font-medium block">Default Commission</span>
            <span className="font-semibold text-[#0F172A] mt-1 block">
              10% Platform Cut
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
