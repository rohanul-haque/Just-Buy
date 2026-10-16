import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Register | JustBuy Marketplace",
  description: "Create an account on JustBuy as a Buyer or Seller.",
};

export default function RegisterPage() {
  return (
    <AuthLayout variant="card" showLogo={false}>
      <RegisterForm />
    </AuthLayout>
  );
}
