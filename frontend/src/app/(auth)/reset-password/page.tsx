import * as React from "react";
import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/auth-card";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Enter your new password to restore account access.",
};

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Create new password"
      description="Your new password must be at least 6 characters and different from previous passwords."
    >
      <React.Suspense
        fallback={
          <div className="py-8">
            <LoadingSpinner size="md" label="Loading reset password..." />
          </div>
        }
      >
        <ResetPasswordForm />
      </React.Suspense>
    </AuthCard>
  );
}

