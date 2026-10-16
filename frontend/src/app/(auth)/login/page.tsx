import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginIllustration } from "@/components/auth/auth-illustrations";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login | JustBuy Marketplace",
  description: "Sign in to access your JustBuy shopping and vendor account.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      illustration={<LoginIllustration imageSrc="/illustration/login.svg" />}
      badgeText="Welcome Back"
    >
      <LoginForm />
    </AuthLayout>
  );
}
