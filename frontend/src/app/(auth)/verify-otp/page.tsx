import { Suspense } from "react";
import type { Metadata } from "next";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { VerifyOtpIllustration } from "@/components/auth/auth-illustrations";
import { VerifyOtpForm } from "@/components/auth/verify-otp-form";

export const metadata: Metadata = {
  title: "Verify OTP | JustBuy Marketplace",
  description: "Enter your 6-digit verification code to confirm your JustBuy account.",
};

function OtpFallback() {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-[#FF5A0A]" />
      <p className="text-sm text-neutral-500 font-medium">Loading verification form...</p>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <AuthLayout
      illustration={<VerifyOtpIllustration />}
      badgeText="Secure Verification"
    >
      <Suspense fallback={<OtpFallback />}>
        <VerifyOtpForm />
      </Suspense>
    </AuthLayout>
  );
}
