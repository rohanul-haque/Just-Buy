import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
  FileText,
  Loader2,
  Mail,
  MapPin,
  RotateCcw,
  Save,
  ShieldCheck,
  Store,
  Upload,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/api/client";
import vendorService from "@/api/services/vendor.service";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

export const SettingsPage: React.FC = () => {
  const { user, vendorProfile, isLoading: isAuthLoading, refreshProfile } = useAuth();

  // Initial values derived from backend data
  // User model is the single source of truth for personal name and email
  const initialName = vendorProfile?.vendor?.name || user?.name || "";
  const initialEmail = vendorProfile?.vendor?.email || user?.email || "";
  const initialLocation = vendorProfile?.location || "";
  const initialLicenceNumber = vendorProfile?.licenceNumber || "";
  const initialProfileUrl = vendorProfile?.profile?.url || null;
  const initialNidFrontUrl = vendorProfile?.nidFrontImage?.url || null;
  const initialNidBackUrl = vendorProfile?.nidBackImage?.url || null;

  // Editable Form States
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [location, setLocation] = useState(initialLocation);
  const [licenceNumber, setLicenceNumber] = useState(initialLicenceNumber);

  // File Upload & Preview States
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(initialProfileUrl);

  const [nidFrontFile, setNidFrontFile] = useState<File | null>(null);
  const [nidFrontPreview, setNidFrontPreview] = useState<string | null>(initialNidFrontUrl);

  const [nidBackFile, setNidBackFile] = useState<File | null>(null);
  const [nidBackPreview, setNidBackPreview] = useState<string | null>(initialNidBackUrl);

  // File Input References
  const profileInputRef = useRef<HTMLInputElement>(null);
  const nidFrontInputRef = useRef<HTMLInputElement>(null);
  const nidBackInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);

  // Synchronize component state whenever vendorProfile or user updates
  useEffect(() => {
    setName(vendorProfile?.vendor?.name || user?.name || "");
    setEmail(vendorProfile?.vendor?.email || user?.email || "");
    setLocation(vendorProfile?.location || "");
    setLicenceNumber(vendorProfile?.licenceNumber || "");

    if (!profileFile) {
      setProfilePreview(vendorProfile?.profile?.url || null);
    }
    if (!nidFrontFile) {
      setNidFrontPreview(vendorProfile?.nidFrontImage?.url || null);
    }
    if (!nidBackFile) {
      setNidBackPreview(vendorProfile?.nidBackImage?.url || null);
    }
  }, [vendorProfile, user, profileFile, nidFrontFile, nidBackFile]);

  // Handle Image File Selection
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
    setPreview: (url: string | null) => void,
    fieldLabel: string,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error(`Please upload a valid image file for ${fieldLabel} (JPEG, PNG, WEBP).`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${fieldLabel} size cannot exceed 5MB.`);
        return;
      }
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Discard local changes and reset form
  const handleResetForm = () => {
    setName(initialName);
    setEmail(initialEmail);
    setLocation(initialLocation);
    setLicenceNumber(initialLicenceNumber);

    setProfileFile(null);
    setProfilePreview(initialProfileUrl);

    setNidFrontFile(null);
    setNidFrontPreview(initialNidFrontUrl);

    setNidBackFile(null);
    setNidBackPreview(initialNidBackUrl);

    toast.info("Unsaved changes reset to current profile values.");
  };

  // Handle Form Submission
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    let hasChanges = false;

    // Validate and append User Information (name and email)
    const trimmedName = name.trim();
    if (trimmedName && trimmedName.length < 2) {
      toast.error("Name must be at least 2 characters long.");
      return;
    }
    if (trimmedName !== initialName) {
      formData.append("name", trimmedName);
      hasChanges = true;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (trimmedEmail !== initialEmail.toLowerCase()) {
      formData.append("email", trimmedEmail);
      hasChanges = true;
    }

    // Validate and append Vendor Information (location and licenceNumber)
    const trimmedLocation = location.trim();
    if (trimmedLocation && trimmedLocation.length < 2) {
      toast.error("Location must be at least 2 characters long.");
      return;
    }
    if (trimmedLocation !== initialLocation) {
      formData.append("location", trimmedLocation);
      hasChanges = true;
    }

    const trimmedLicenceNumber = licenceNumber.trim();
    if (trimmedLicenceNumber && trimmedLicenceNumber.length < 3) {
      toast.error("Licence number must be at least 3 characters long.");
      return;
    }
    if (trimmedLicenceNumber !== initialLicenceNumber) {
      formData.append("licenceNumber", trimmedLicenceNumber);
      hasChanges = true;
    }

    // Append Image Files
    if (profileFile) {
      formData.append("profile", profileFile);
      hasChanges = true;
    }

    if (nidFrontFile) {
      formData.append("nidFrontImage", nidFrontFile);
      hasChanges = true;
    }

    if (nidBackFile) {
      formData.append("nidBackImage", nidBackFile);
      hasChanges = true;
    }

    if (!hasChanges) {
      toast.info("No profile changes detected.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await vendorService.updateOwnProfile(formData);
      if (response.success) {
        toast.success(response.message || "Vendor settings updated successfully!");
        setProfileFile(null);
        setNidFrontFile(null);
        setNidBackFile(null);
        await refreshProfile();
      } else {
        toast.error(response.message || "Failed to update vendor settings.");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = name || initialName || "";
  const displayEmail = email || initialEmail || "";
  const userRole = vendorProfile?.vendor?.role || user?.role || "VENDOR";
  const userStatus = vendorProfile?.vendor?.status || user?.status || "ACTIVE";
  // Vendor Approval Status dynamically reads from Vendor.status (read-only)
  const vendorApprovalStatus = vendorProfile?.status || "PENDING";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 1. Page Heading */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
          Vendor Settings
        </h2>
        <p className="text-sm text-[#64748B] mt-1">
          Manage your personal profile, business details, and verification documents.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Personal Profile */}
        <Card className="rounded-md p-6 md:p-8 border-[#E5E7EB] bg-white space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <ProfileAvatar
                src={profilePreview}
                alt={displayName || "Profile Photo"}
                className="w-24 h-24 rounded-full border-2 border-[#E5E7EB] shadow-xs"
              />
              <Button
                type="button"
                size="icon"
                onClick={() => profileInputRef.current?.click()}
                disabled={isSaving || isAuthLoading}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-sm cursor-pointer"
                title="Change Profile Photo"
              >
                <Camera className="w-4 h-4" />
              </Button>
              <input
                type="file"
                ref={profileInputRef}
                onChange={(e) =>
                  handleFileChange(e, setProfileFile, setProfilePreview, "Profile Photo")
                }
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
              />
            </div>

            <div className="text-center sm:text-left space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h4 className="text-lg font-bold text-[#0F172A]">{displayName || "—"}</h4>
                <span className="bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE] px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase">
                  {userRole}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border ${
                    userStatus === "ACTIVE"
                      ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                      : "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
                  }`}
                >
                  {userStatus}
                </span>
              </div>
              <p className="text-sm text-[#4B5563]">{displayEmail || "—"}</p>
            </div>
          </div>

          <div className="border-t border-[#F1F5F9] pt-4">
            <h3 className="text-sm font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#6366F1]" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name (User.name) */}
              <div className="space-y-2">
                <label
                  htmlFor="vendor-name"
                  className="text-xs font-semibold text-[#111827] block"
                >
                  Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#4B5563] absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="vendor-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    disabled={isSaving}
                    className="pl-9 h-10 rounded-md bg-white border-[#E5E7EB] text-[#0F172A] text-sm focus:ring-[#4F46E5]/30 focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              {/* Email Address (User.email) */}
              <div className="space-y-2">
                <label
                  htmlFor="vendor-email"
                  className="text-xs font-semibold text-[#111827] block"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#4B5563] absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="vendor-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={isSaving}
                    className="pl-9 h-10 rounded-md bg-white border-[#E5E7EB] text-[#0F172A] text-sm focus:ring-[#4F46E5]/30 focus:border-[#4F46E5]"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 2: Business Information */}
        <Card className="rounded-md p-6 md:p-8 border-[#E5E7EB] bg-white space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
            <h3 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
              <Store className="w-4 h-4 text-[#6366F1]" /> Business Information
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#64748B]">Approval Status:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border ${
                  vendorApprovalStatus === "APPROVED"
                    ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                    : vendorApprovalStatus === "PENDING"
                      ? "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]"
                      : vendorApprovalStatus === "REJECTED"
                        ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
                        : "bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]"
                }`}
              >
                {vendorApprovalStatus}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Location */}
            <div className="space-y-2">
              <label
                htmlFor="vendor-location"
                className="text-xs font-semibold text-[#111827] block"
              >
                Business Location / Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#4B5563] absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="vendor-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Level 3, Block B, Jamuna Future Park, Dhaka"
                  disabled={isSaving}
                  className="pl-9 h-10 rounded-md bg-white border-[#E5E7EB] text-[#0F172A] text-sm focus:ring-[#4F46E5]/30 focus:border-[#4F46E5]"
                />
              </div>
            </div>

            {/* License Number */}
            <div className="space-y-2">
              <label
                htmlFor="vendor-licence-number"
                className="text-xs font-semibold text-[#111827] block"
              >
                Trade License Number
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-[#4B5563] absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="vendor-licence-number"
                  type="text"
                  value={licenceNumber}
                  onChange={(e) => setLicenceNumber(e.target.value)}
                  placeholder="e.g. TRAD/DNCC/123456/2026"
                  disabled={isSaving}
                  className="pl-9 h-10 rounded-md bg-white border-[#E5E7EB] text-[#0F172A] text-sm focus:ring-[#4F46E5]/30 focus:border-[#4F46E5]"
                />
              </div>
            </div>

            {/* Vendor Approval Status (Read-Only) */}
            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="vendor-status"
                className="text-xs font-semibold text-[#111827] block"
              >
                Vendor Approval Status
              </label>
              <div className="flex items-center h-10 px-3 rounded-md bg-[#F8FAFC] border border-[#E5E7EB]">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border ${
                    vendorApprovalStatus === "APPROVED"
                      ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                      : vendorApprovalStatus === "PENDING"
                        ? "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]"
                        : vendorApprovalStatus === "REJECTED"
                          ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
                          : "bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]"
                  }`}
                >
                  {vendorApprovalStatus}
                </span>
                <span className="text-xs text-[#64748B] ml-2">(Read-only)</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 3: Identity Verification (NID Documents) */}
        <Card className="rounded-md p-6 md:p-8 border-[#E5E7EB] bg-white space-y-6 shadow-xs">
          <div className="border-b border-[#F1F5F9] pb-4">
            <h3 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#6366F1]" /> Verification Documents (National ID)
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              Upload clear photos or scans of your National ID (Front and Back sides).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NID Front Image */}
            <div className="border border-[#E5E7EB] rounded-lg p-4 bg-[#F8FAFC] space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#111827] block">
                  NID Front Side
                </span>
                <span className="text-xs text-[#64748B]">
                  Clear picture showing your photo and details
                </span>
              </div>

              <div className="relative w-full h-40 bg-white rounded-md border border-[#E5E7EB] overflow-hidden flex items-center justify-center">
                {nidFrontPreview ? (
                  <img
                    src={nidFrontPreview}
                    alt="NID Front Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-[#94A3B8] p-4 text-center">
                    <FileText className="w-8 h-8 mb-1 stroke-1" />
                    <span className="text-xs">No front document uploaded</span>
                  </div>
                )}
              </div>

              <div className="pt-1">
                <input
                  type="file"
                  ref={nidFrontInputRef}
                  onChange={(e) =>
                    handleFileChange(e, setNidFrontFile, setNidFrontPreview, "NID Front")
                  }
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => nidFrontInputRef.current?.click()}
                  disabled={isSaving}
                  className="w-full h-9 text-xs rounded-md border-[#E5E7EB] text-[#374151] hover:bg-white cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  {nidFrontPreview ? "Change Front Image" : "Upload Front Image"}
                </Button>
              </div>
            </div>

            {/* NID Back Image */}
            <div className="border border-[#E5E7EB] rounded-lg p-4 bg-[#F8FAFC] space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#111827] block">
                  NID Back Side
                </span>
                <span className="text-xs text-[#64748B]">
                  Clear picture showing address and barcode
                </span>
              </div>

              <div className="relative w-full h-40 bg-white rounded-md border border-[#E5E7EB] overflow-hidden flex items-center justify-center">
                {nidBackPreview ? (
                  <img
                    src={nidBackPreview}
                    alt="NID Back Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-[#94A3B8] p-4 text-center">
                    <FileText className="w-8 h-8 mb-1 stroke-1" />
                    <span className="text-xs">No back document uploaded</span>
                  </div>
                )}
              </div>

              <div className="pt-1">
                <input
                  type="file"
                  ref={nidBackInputRef}
                  onChange={(e) =>
                    handleFileChange(e, setNidBackFile, setNidBackPreview, "NID Back")
                  }
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => nidBackInputRef.current?.click()}
                  disabled={isSaving}
                  className="w-full h-9 text-xs rounded-md border-[#E5E7EB] text-[#374151] hover:bg-white cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  {nidBackPreview ? "Change Back Image" : "Upload Back Image"}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 4: Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleResetForm}
            disabled={isSaving}
            className="w-full sm:w-auto h-10 px-5 rounded-md border-[#E5E7EB] text-[#374151] hover:bg-[#F8FAFC] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            <span>Discard Changes</span>
          </Button>

          <Button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto h-10 px-6 rounded-md bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium text-sm transition flex items-center justify-center cursor-pointer shadow-xs"
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
    </div>
  );
};

export default SettingsPage;
