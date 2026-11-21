"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import {
  forgotPasswordFormSchema,
  type ForgotPasswordFormValues,
} from "@/features/auth/schemas";
import { useForgotPassword } from "@/features/auth/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import type { ApiErrorResponse } from "@/lib/api-error";
import notify from "@/lib/toast";

export function ForgotPasswordForm() {
  const forgotPasswordMutation = useForgotPassword();
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setApiError(null);

    forgotPasswordMutation.mutate(values, {
      onSuccess: () => {
        setSubmittedEmail(values.email);
        setIsSubmitted(true);
        notify.success("Password reset link sent to your email.");
      },
      onError: (err: ApiErrorResponse) => {
        const msg =
          err.message ||
          "Unable to send password reset link. Please try again.";
        setApiError(msg);
        notify.error(msg);
      },
    });
  };

  const isPending = isSubmitting || forgotPasswordMutation.isPending;

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex size-12 mx-auto items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-6" />
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-semibold text-foreground">
            Check your inbox
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If an account with{" "}
            <strong className="text-foreground">{submittedEmail}</strong> exists,
            we have sent instructions and a reset link to your email.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/login">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="size-4" />
              <span>Back to Sign In</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 text-base font-semibold mt-2"
      >
        {isPending ? (
          <LoadingSpinner size="sm" label="Sending reset link..." />
        ) : (
          "Send Reset Link"
        )}
      </Button>

      <div className="text-center pt-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </form>
  );
}
