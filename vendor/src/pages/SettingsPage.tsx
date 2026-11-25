import { getApiErrorMessage } from "@/api/client";
import vendorService from "@/api/services/vendor.service";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  RotateCcw,
  Save,
  ShieldCheck,
  Upload,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    vendorProfile,
    refreshProfile,
  } = useAuth();

  // Initial values derived from backend data
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
  const [profilePreview, setProfilePreview] = useState<string | null>(
    initialProfileUrl,
  );

  const [nidFrontFile, setNidFrontFile] = useState<File | null>(null);
  const [nidFrontPreview, setNidFrontPreview] = useState<string | null>(
    initialNidFrontUrl,
  );

  const [nidBackFile, setNidBackFile] = useState<File | null>(null);
  const [nidBackPreview, setNidBackPreview] = useState<string | null>(
    initialNidBackUrl,
  );

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
        toast.error(
          `Please upload a valid image file for ${fieldLabel} (JPEG, PNG, WEBP).`,
        );
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
        toast.success(
          response.message || "Vendor settings updated successfully!",
        );
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
  const vendorApprovalStatus = vendorProfile?.status || "PENDING";

  return (
    <div className="space-y-8 max-w-5xl">
      <form onSubmit={handleSaveSettings} className="space-y-8">
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
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] tracking-tight">
                Personal Information
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Manage your personal profile, business details, and verification documents.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetForm}
              disabled={isSaving}
              className="h-11 px-5 rounded-md border border-[#ffceb0]/80 bg-[#FFE7D9] hover:bg-[#ffceb0] text-[#1F2937] text-sm cursor-pointer font-medium"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Discard
            </Button>

            <Button
              type="submit"
              disabled={isSaving}
              className="h-11 px-8 rounded-md bg-[#FE6201] hover:bg-[#E55801] text-white font-medium text-sm transition-colors shadow-xs cursor-pointer disabled:opacity-50 flex-1 sm:flex-none"
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
        </div>

        {/* Account Verification & Approval Notice Banner */}
        {vendorApprovalStatus === "PENDING" && (
          <div className="p-4 rounded-xl bg-[#FFE7D9] border border-[#ffceb0]/80 text-[#7C2D12] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#FE6201] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-[#7C2D12]">
                  Vendor Account Under Review (Pending Approval)
                </h4>
                <p className="text-xs text-[#7C2D12]/80 mt-0.5">
                  Your account is currently pending admin review. Please complete
                  and save all your profile details, business information, and
                  National ID documents below.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#ffefe6] text-[#FE6201] border border-[#ffceb0] whitespace-nowrap self-start sm:self-center">
              Pending Review
            </span>
          </div>
        )}

        {vendorApprovalStatus === "REJECTED" && (
          <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-[#991B1B]">
                Application Rejected
              </h4>
              <p className="text-xs text-[#B91C1C] mt-0.5">
                Your vendor application was not approved. Please verify your
                submitted information, re-upload clear identity documents, and
                save changes to resubmit your profile for admin review.
              </p>
            </div>
          </div>
        )}

        {vendorApprovalStatus === "APPROVED" && (
          <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] flex items-start gap-3 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-[#065F46]">
                Account Approved & Active
              </h4>
              <p className="text-xs text-[#047857] mt-0.5">
                Your vendor profile is verified and active. You have full access
                to manage products, view sales analytics, and process customer
                orders.
              </p>
            </div>
          </div>
        )}

        {/* Main Content Layout: Left Profile Card, Right Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left: Profile Card (Rounded Peach-Orange Box) */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-8 sm:p-10 rounded-xl border border-[#ffceb0]/80 bg-[#FFE7D9] shadow-xs text-center space-y-4 min-h-[340px]">
            <div
              className="relative group cursor-pointer"
              onClick={() => profileInputRef.current?.click()}
            >
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-[#FE6201]/30 shadow-xs flex items-center justify-center bg-black/10 relative">
                <ProfileAvatar
                  src={profilePreview}
                  alt={displayName || "Vendor"}
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
                ref={profileInputRef}
                onChange={(e) =>
                  handleFileChange(
                    e,
                    setProfileFile,
                    setProfilePreview,
                    "Profile Photo",
                  )
                }
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-normal text-[#6B7280] block">
                Profile
              </span>
              <h3 className="text-xl font-bold text-[#1F2937]">
                {displayName || "Vendor"}
              </h3>
              <p className="text-xs text-[#6B7280] truncate max-w-[220px]">
                {displayEmail || "—"}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <Badge className="bg-[#CB4E01]/10 text-[#FE6201] border-transparent font-semibold text-xs px-2.5 py-0.5">
                {userRole}
              </Badge>
              <Badge
                className={`text-xs px-2.5 py-0.5 font-semibold ${
                  vendorApprovalStatus === "APPROVED"
                    ? "bg-[#10B981]/10 text-[#10B981] border-transparent"
                    : vendorApprovalStatus === "PENDING"
                      ? "bg-[#F59E0B]/10 text-[#D97706] border-transparent"
                      : "bg-[#EF4444]/10 text-[#EF4444] border-transparent"
                }`}
              >
                {vendorApprovalStatus}
              </Badge>
            </div>
          </div>

          {/* Right: Form Inputs (Personal, Business, and Verification Documents) */}
          <div className="md:col-span-8 space-y-6">
            {/* 1. Name */}
            <div className="space-y-2">
              <label
                htmlFor="vendor-name"
                className="text-sm font-semibold text-[#1F2937] block"
              >
                Name
              </label>
              <Input
                id="vendor-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                disabled={isSaving}
                className="h-12 px-4 rounded-xl bg-[#FFE7D9] border border-[#ffceb0]/80 text-[#1F2937] text-sm focus:outline-none focus-visible:outline-none focus:border-[#fe6201] focus-visible:ring-1 focus-visible:ring-[#fe6201] shadow-xs"
              />
            </div>

            {/* 2. Email */}
            <div className="space-y-2">
              <label
                htmlFor="vendor-email"
                className="text-sm font-semibold text-[#1F2937] block"
              >
                Email
              </label>
              <Input
                id="vendor-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isSaving}
                className="h-12 px-4 rounded-xl bg-[#FFE7D9] border border-[#ffceb0]/80 text-[#1F2937] text-sm focus:outline-none focus-visible:outline-none focus:border-[#fe6201] focus-visible:ring-1 focus-visible:ring-[#fe6201] shadow-xs"
              />
            </div>

            {/* 3. Business Location */}
            <div className="space-y-2">
              <label
                htmlFor="vendor-location"
                className="text-sm font-semibold text-[#1F2937] block"
              >
                Business Location / Address
              </label>
              <Input
                id="vendor-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Level 3, Block B, Jamuna Future Park, Dhaka"
                disabled={isSaving}
                className="h-12 px-4 rounded-xl bg-[#FFE7D9] border border-[#ffceb0]/80 text-[#1F2937] text-sm focus:outline-none focus-visible:outline-none focus:border-[#fe6201] focus-visible:ring-1 focus-visible:ring-[#fe6201] shadow-xs"
              />
            </div>

            {/* 4. Trade License Number */}
            <div className="space-y-2">
              <label
                htmlFor="vendor-licence-number"
                className="text-sm font-semibold text-[#1F2937] block"
              >
                Trade License Number
              </label>
              <Input
                id="vendor-licence-number"
                type="text"
                value={licenceNumber}
                onChange={(e) => setLicenceNumber(e.target.value)}
                placeholder="e.g. TRAD/DNCC/123456/2026"
                disabled={isSaving}
                className="h-12 px-4 rounded-xl bg-[#FFE7D9] border border-[#ffceb0]/80 text-[#1F2937] text-sm focus:outline-none focus-visible:outline-none focus:border-[#fe6201] focus-visible:ring-1 focus-visible:ring-[#fe6201] shadow-xs"
              />
            </div>

            {/* 5. Identity Verification (National ID Documents) */}
            <div className="p-6 sm:p-8 rounded-xl border border-[#ffceb0]/80 bg-[#FFE7D9] shadow-xs space-y-4">
              <div className="border-b border-[#ffceb0]/80 pb-3">
                <h3 className="text-base font-bold text-[#1F2937] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#FE6201]" /> Verification Documents (National ID)
                </h3>
                <p className="text-xs text-[#6B7280] mt-1">
                  Upload clear photos or scans of your National ID (Front and Back sides).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                {/* NID Front Image */}
                <div className="border border-[#ffceb0]/80 rounded-xl p-4 bg-white/70 space-y-3 flex flex-col justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#1F2937] block">
                      NID Front Side
                    </span>
                    <span className="text-[11px] text-[#6B7280]">
                      Showing photo and personal details
                    </span>
                  </div>

                  <div className="relative w-full h-36 bg-[#FFE7D9] rounded-xl border border-[#ffceb0]/80 overflow-hidden flex items-center justify-center">
                    {nidFrontPreview ? (
                      <img
                        src={nidFrontPreview}
                        alt="NID Front Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#9CA3AF] p-4 text-center">
                        <FileText className="w-8 h-8 mb-1 stroke-1 text-[#FE6201]/60" />
                        <span className="text-xs">No front document uploaded</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <input
                      type="file"
                      ref={nidFrontInputRef}
                      onChange={(e) =>
                        handleFileChange(
                          e,
                          setNidFrontFile,
                          setNidFrontPreview,
                          "NID Front",
                        )
                      }
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => nidFrontInputRef.current?.click()}
                      disabled={isSaving}
                      className="w-full h-9 text-xs font-semibold rounded-xl bg-[#ffefe6] hover:bg-[#ffceb0]/60 text-[#1F2937] border border-[#ffceb0]/80 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5 text-[#FE6201]" />
                      {nidFrontPreview ? "Change Front Image" : "Upload Front Image"}
                    </Button>
                  </div>
                </div>

                {/* NID Back Image */}
                <div className="border border-[#ffceb0]/80 rounded-xl p-4 bg-white/70 space-y-3 flex flex-col justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#1F2937] block">
                      NID Back Side
                    </span>
                    <span className="text-[11px] text-[#6B7280]">
                      Showing address and barcode
                    </span>
                  </div>

                  <div className="relative w-full h-36 bg-[#FFE7D9] rounded-xl border border-[#ffceb0]/80 overflow-hidden flex items-center justify-center">
                    {nidBackPreview ? (
                      <img
                        src={nidBackPreview}
                        alt="NID Back Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#9CA3AF] p-4 text-center">
                        <FileText className="w-8 h-8 mb-1 stroke-1 text-[#FE6201]/60" />
                        <span className="text-xs">No back document uploaded</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <input
                      type="file"
                      ref={nidBackInputRef}
                      onChange={(e) =>
                        handleFileChange(
                          e,
                          setNidBackFile,
                          setNidBackPreview,
                          "NID Back",
                        )
                      }
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => nidBackInputRef.current?.click()}
                      disabled={isSaving}
                      className="w-full h-9 text-xs font-semibold rounded-xl bg-[#ffefe6] hover:bg-[#ffceb0]/60 text-[#1F2937] border border-[#ffceb0]/80 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5 text-[#FE6201]" />
                      {nidBackPreview ? "Change Back Image" : "Upload Back Image"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Save Action Button */}
            <div className="flex justify-end pt-2">
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
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
