import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound, ShieldAlert } from "lucide-react";
import { AuthCard } from "@/features/auth/components/auth-card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Change Password",
  description: "Update or reset your JustBuy account password.",
};

export default function ChangePasswordPage() {
  return (
    <AuthCard
      title="Password Management"
      description="Protect your account with a secure, verified password."
    >
      <div className="space-y-6 text-center">
        <div className="flex size-14 mx-auto items-center justify-center rounded-full bg-primary/10 text-primary">
          <KeyRound className="size-7" />
        </div>

        <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>
            For your security, password updates require email verification to prevent unauthorized account changes.
          </p>
          <div className="flex items-start gap-2 text-left bg-muted/40 p-3 rounded-lg border border-border mt-3 text-xs">
            <ShieldAlert className="size-4 shrink-0 text-primary mt-0.5" />
            <span>
              If you forgot your password or need to reset it, request a secure reset link to your email.
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Link href="/forgot-password">
            <Button className="w-full">Request Password Reset Link</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}

