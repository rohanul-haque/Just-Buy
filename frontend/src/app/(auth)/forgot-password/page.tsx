import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordIllustration } from "@/components/auth/auth-illustrations";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password | JustBuy Marketplace",
  description: "Request a password recovery code for your JustBuy account.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      illustration={<ForgotPasswordIllustration />}
      badgeText="Password Recovery"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
