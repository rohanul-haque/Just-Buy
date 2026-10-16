import { Suspense } from "react";
import type { Metadata } from "next";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordIllustration } from "@/components/auth/auth-illustrations";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password | JustBuy Marketplace",
  description: "Set a new password for your JustBuy account.",
};

function ResetFallback() {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-[#FF5A0A]" />
      <p className="text-sm text-neutral-500 font-medium">Loading password reset form...</p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      illustration={<ResetPasswordIllustration />}
      badgeText="Security"
    >
      <Suspense fallback={<ResetFallback />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
