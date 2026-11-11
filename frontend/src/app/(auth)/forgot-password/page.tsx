import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/auth-card";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your JustBuy account password via email verification.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter the email associated with your account and we'll send you a password reset link."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}

