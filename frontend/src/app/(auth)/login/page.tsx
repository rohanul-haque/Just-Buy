<<<<<<< HEAD
import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginIllustration } from "@/components/auth/auth-illustrations";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login | JustBuy Marketplace",
  description: "Sign in to access your JustBuy shopping and vendor account.",
=======
import * as React from "react";
import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/auth-card";
import { LoginForm } from "@/features/auth/components/login-form";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your JustBuy account to track orders and manage wishlist.",
>>>>>>> origin/develop
};

export default function LoginPage() {
  return (
<<<<<<< HEAD
    <AuthLayout
      illustration={<LoginIllustration imageSrc="/illustration/login.svg" />}
      badgeText="Welcome Back"
    >
      <LoginForm />
    </AuthLayout>
  );
}
=======
    <AuthCard
      title="Welcome back"
      description="Enter your email address and password to sign in to your account."
    >
      <React.Suspense
        fallback={
          <div className="py-8">
            <LoadingSpinner size="md" label="Loading sign in form..." />
          </div>
        }
      >
        <LoginForm />
      </React.Suspense>
    </AuthCard>
  );
}

>>>>>>> origin/develop
