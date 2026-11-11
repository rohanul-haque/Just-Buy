import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/auth-card";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Create an Account",
  description: "Sign up as a buyer on JustBuy and enjoy fast, secure shopping.",
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Join thousands of shoppers and discover great products from verified vendors."
    >
      <RegisterForm />
    </AuthCard>
  );
}

