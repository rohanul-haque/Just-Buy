import type { Metadata } from "next";
<<<<<<< HEAD
import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordIllustration } from "@/components/auth/auth-illustrations";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password | JustBuy Marketplace",
  description: "Request a password recovery code for your JustBuy account.",
=======
import { AuthCard } from "@/features/auth/components/auth-card";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your JustBuy account password via email verification.",
>>>>>>> origin/develop
};

export default function ForgotPasswordPage() {
  return (
<<<<<<< HEAD
    <AuthLayout
      illustration={<ForgotPasswordIllustration />}
      badgeText="Password Recovery"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
=======
    <AuthCard
      title="Forgot your password?"
      description="Enter the email associated with your account and we'll send you a password reset link."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}

>>>>>>> origin/develop
