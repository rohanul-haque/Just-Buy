import type { Metadata } from "next";
<<<<<<< HEAD
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Register | JustBuy Marketplace",
  description: "Create an account on JustBuy as a Buyer or Seller.",
=======
import { AuthCard } from "@/features/auth/components/auth-card";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Create an Account",
  description: "Sign up as a buyer on JustBuy and enjoy fast, secure shopping.",
>>>>>>> origin/develop
};

export default function RegisterPage() {
  return (
<<<<<<< HEAD
    <AuthLayout variant="card" showLogo={false}>
      <RegisterForm />
    </AuthLayout>
  );
}
=======
    <AuthCard
      title="Create your account"
      description="Join thousands of shoppers and discover great products from verified vendors."
    >
      <RegisterForm />
    </AuthCard>
  );
}

>>>>>>> origin/develop
