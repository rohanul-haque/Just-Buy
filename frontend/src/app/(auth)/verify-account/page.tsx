import * as React from "react";
import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/auth-card";
import { VerifyOtpForm } from "@/features/auth/components/verify-otp-form";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export const metadata: Metadata = {
  title: "Verify Account",
  description: "Enter the 5-digit verification code sent to your email.",
};

export default function VerifyAccountPage() {
  return (
    <AuthCard
      title="Verify your account"
      description="Enter the 5-digit verification code sent to your email to activate your account."
    >
      <React.Suspense
        fallback={
          <div className="py-8">
            <LoadingSpinner size="md" label="Loading verification..." />
          </div>
        }
      >
        <VerifyOtpForm />
      </React.Suspense>
    </AuthCard>
  );
}

