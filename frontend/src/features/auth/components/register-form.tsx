"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import {
  registerFormSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas";
import { useRegister } from "@/features/auth/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import type { ApiErrorResponse } from "@/lib/api-error";
import notify from "@/lib/toast";

export function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [apiError, setApiError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setApiError(null);

    registerMutation.mutate(
      {
        name: values.name,
        email: values.email,
        password: values.password,
        role: "BUYER",
      },
      {
        onSuccess: () => {
          notify.success(
            "Account created successfully!",
            "Please check your email for the verification code.",
          );
          router.push(
            `/verify-account?email=${encodeURIComponent(values.email)}`,
          );
        },
        onError: (err: ApiErrorResponse) => {
          const msg =
            err.message || "Failed to create account. Please try again.";
          setApiError(msg);
          notify.error(msg);
        },
      },
    );
  };

  const isPending = isSubmitting || registerMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {apiError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Name Field */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="e.g. Sarah Jenkins"
          autoComplete="name"
          disabled={isPending}
          hasError={!!errors.name}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-destructive font-medium mt-1">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          disabled={isPending}
          hasError={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive font-medium mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          placeholder="Minimum 6 characters"
          autoComplete="new-password"
          disabled={isPending}
          hasError={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-destructive font-medium mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <PasswordInput
          id="confirmPassword"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          disabled={isPending}
          hasError={!!errors.confirmPassword}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive font-medium mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 text-base font-semibold mt-2"
      >
        {isPending ? (
          <LoadingSpinner size="sm" label="Creating Account..." />
        ) : (
          "Create Account"
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground pt-1">
        By registering, you agree to JustBuy&apos;s Terms of Service and Privacy Policy.
      </p>

      <div className="text-center text-sm pt-2">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link
          href="/login"
          className="font-semibold text-primary hover:underline"
        >
          Sign In
        </Link>
      </div>
    </form>
  );
}

