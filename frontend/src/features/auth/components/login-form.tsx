"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { loginFormSchema, type LoginFormValues } from "@/features/auth/schemas";
import { useLogin } from "@/features/auth/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import type { ApiErrorResponse } from "@/lib/api-error";
import notify from "@/lib/toast";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLogin();

  const [apiError, setApiError] = React.useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = React.useState<string | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setApiError(null);
    setUnverifiedEmail(null);

    loginMutation.mutate(values, {
      onSuccess: (response) => {
        notify.success("Login successful. Welcome back!");
        const destination =
          searchParams.get("redirect") ||
          response?.data?.redirectUrl ||
          "/profile";
        router.push(destination);
      },
      onError: (err: ApiErrorResponse) => {
        if (
          err.statusCode === 403 &&
          err.code === "AUTH_EMAIL_NOT_VERIFIED"
        ) {
          setUnverifiedEmail(values.email);
          notify.warning("Please verify your account to log in.");
        } else {
          const msg =
            err.message || "Invalid credentials. Please verify your details.";
          setApiError(msg);
          notify.error(msg);
        }
      },
    });
  };

  const isPending = isSubmitting || loginMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Unverified Email Alert with Direct Action */}
      {unverifiedEmail && (
        <div
          role="alert"
          className="flex flex-col gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <span>
              Your email address has not been verified yet. Please enter the OTP
              sent to your inbox to activate your account.
            </span>
          </div>
          <Link
            href={`/verify-account?email=${encodeURIComponent(unverifiedEmail)}`}
            className="self-end"
          >
            <Button size="sm" variant="outline" className="text-xs h-7">
              Verify Account Now
            </Button>
          </Link>
        </div>
      )}

      {/* Standard API Error Alert */}
      {apiError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

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
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="password"
          placeholder="Enter your password"
          autoComplete="current-password"
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

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 text-base font-semibold mt-2"
      >
        {isPending ? (
          <LoadingSpinner size="sm" label="Signing in..." />
        ) : (
          "Sign In"
        )}
      </Button>

      <div className="text-center text-sm pt-4 border-t border-border/80">
        <span className="text-muted-foreground">Don&apos;t have an account? </span>
        <Link
          href="/register"
          className="font-semibold text-primary hover:underline"
        >
          Create an Account
        </Link>
      </div>
    </form>
  );
}

