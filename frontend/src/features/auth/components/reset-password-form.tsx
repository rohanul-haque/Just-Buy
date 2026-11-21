"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import {
  resetPasswordFormSchema,
  type ResetPasswordFormValues,
} from "@/features/auth/schemas";
import { useResetPassword } from "@/features/auth/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import type { ApiErrorResponse } from "@/lib/api-error";
import notify from "@/lib/toast";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token") || "";

  const resetPasswordMutation = useResetPassword();
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      token: tokenParam,
      newPassword: "",
      confirmPassword: "",
    },
  });

  React.useEffect(() => {
    if (tokenParam) {
      setValue("token", tokenParam);
    }
  }, [tokenParam, setValue]);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setApiError(null);
    setSuccessMessage(null);

    resetPasswordMutation.mutate(
      {
        token: values.token,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          notify.success(
            "Password changed successfully!",
            "Redirecting you to login...",
          );
          setSuccessMessage(
            "Password has been reset successfully! Redirecting you to login...",
          );
          setTimeout(() => {
            router.push("/login?reset=true");
          }, 1800);
        },
        onError: (err: ApiErrorResponse) => {
          const msg =
            err.message ||
            "Invalid or expired reset token. Please request a new link.";
          setApiError(msg);
          notify.error(msg);
        },
      },
    );
  };

  const isPending = isSubmitting || resetPasswordMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Error Alert */}
      {apiError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-800 dark:text-emerald-300"
        >
          <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Token Field (hidden or read-only if present, editable if missing) */}
      {!tokenParam && (
        <div className="space-y-1.5">
          <Label htmlFor="token">Reset Token</Label>
          <Input
            id="token"
            type="text"
            placeholder="Paste your reset token here"
            disabled={isPending}
            hasError={!!errors.token}
            {...register("token")}
          />
          {errors.token && (
            <p className="text-xs text-destructive font-medium mt-1">
              {errors.token.message}
            </p>
          )}
        </div>
      )}

      {/* New Password Field */}
      <div className="space-y-1.5">
        <Label htmlFor="newPassword">New Password</Label>
        <PasswordInput
          id="newPassword"
          placeholder="Minimum 6 characters"
          autoComplete="new-password"
          disabled={isPending}
          hasError={!!errors.newPassword}
          {...register("newPassword")}
        />
        {errors.newPassword && (
          <p className="text-xs text-destructive font-medium mt-1">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <PasswordInput
          id="confirmPassword"
          placeholder="Re-enter your new password"
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
          <LoadingSpinner size="sm" label="Resetting password..." />
        ) : (
          "Reset Password"
        )}
      </Button>

      <div className="text-center pt-2">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Remember your password? <span className="text-primary font-semibold">Sign In</span>
        </Link>
      </div>
    </form>
  );
}

