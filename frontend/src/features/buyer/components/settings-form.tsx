"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/features/buyer/schemas";
import { useCurrentUser, useForgotPassword } from "@/features/auth/hooks/use-auth";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import notify from "@/lib/toast";

export function SettingsForm() {
  const { data: user } = useCurrentUser();
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async () => {
    if (!user?.email) {
      notify.error("User email is not available. Please sign in again.");
      return;
    }

    forgotPasswordMutation.mutate(
      { email: user.email },
      {
        onSuccess: () => {
          notify.success(
            "Password verification link sent!",
            "Please check your inbox to confirm your password update.",
          );
          reset();
        },
        onError: (err) => {
          notify.apiError(err, "Failed to initiate password change.");
        },
      },
    );
  };

  const isPending = isSubmitting || forgotPasswordMutation.isPending;

  return (
    <div className="space-y-6 w-full max-w-xl">
      {/* Title matching Figma Image 3 */}
      <h1 className="text-xl md:text-2xl font-bold text-primary tracking-tight">
        Change password
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Current Password Field */}
        <div className="space-y-2">
          <Label
            htmlFor="currentPassword"
            className="text-sm font-medium text-foreground"
          >
            Current Password
          </Label>
          <PasswordInput
            id="currentPassword"
            placeholder="••••••••••••"
            hasError={Boolean(errors.currentPassword)}
            disabled={isPending}
            {...register("currentPassword")}
          />
          {errors.currentPassword && (
            <p className="text-xs text-destructive">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        {/* New Password Field */}
        <div className="space-y-2">
          <Label
            htmlFor="newPassword"
            className="text-sm font-medium text-foreground"
          >
            New Password
          </Label>
          <PasswordInput
            id="newPassword"
            placeholder="••••••••••••"
            hasError={Boolean(errors.newPassword)}
            disabled={isPending}
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <p className="text-xs text-destructive">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Confirm New Password Field */}
        <div className="space-y-2">
          <Label
            htmlFor="confirmNewPassword"
            className="text-sm font-medium text-foreground"
          >
            Confirm New Password
          </Label>
          <PasswordInput
            id="confirmNewPassword"
            placeholder="••••••••••••"
            hasError={Boolean(errors.confirmNewPassword)}
            disabled={isPending}
            {...register("confirmNewPassword")}
          />
          {errors.confirmNewPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmNewPassword.message}
            </p>
          )}
        </div>

        {/* Centered Save Changes Button matching Figma */}
        <div className="pt-2 text-center text-xs text-muted-foreground">
          Password updates are verified via a secure link sent to your registered email address ({user?.email || "loading..."}).
        </div>

        <div className="pt-2 flex justify-center">
          <Button
            type="submit"
            disabled={isPending}
            className="px-10 py-2.5 font-medium rounded-xl min-w-37.5"
          >
            {isPending ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                <span>Saving...</span>
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
