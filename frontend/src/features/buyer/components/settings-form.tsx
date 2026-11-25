"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/features/buyer/schemas";
import { useChangePassword } from "@/features/auth/hooks/use-auth";
import { Button } from "@/components/ui/button";
import notify from "@/lib/toast";

export function SettingsForm() {
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const changePasswordMutation = useChangePassword();

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

  const onSubmit = async (values: ChangePasswordFormValues) => {
    changePasswordMutation.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          notify.success("Password changed successfully!");
          reset();
        },
        onError: (err) => {
          notify.apiError(
            err,
            "Failed to change password. Please verify your current password.",
          );
        },
      },
    );
  };

  const isPending = isSubmitting || changePasswordMutation.isPending;

  return (
    <div className="w-full max-w-2xl">
      {/* Title matching mockup */}
      <h1 className="text-xl sm:text-2xl font-medium text-[#ff6200] tracking-tight mb-7 sm:mb-8">
        Change password
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Current Password Field */}
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-base sm:text-lg font-normal text-neutral-900 mb-2"
          >
            Current Password
          </label>
          <div className="relative">
            <input
              id="currentPassword"
              type={showCurrent ? "text" : "password"}
              placeholder="••••••••••••"
              disabled={isPending}
              className="w-full h-[52px] rounded-md border border-neutral-700/80 bg-white px-4 pr-12 text-sm sm:text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200] transition-colors"
              {...register("currentPassword")}
            />
            <button
              type="button"
              onClick={() => setShowCurrent((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-700 hover:text-neutral-900 focus:outline-none cursor-pointer"
              aria-label={showCurrent ? "Hide password" : "Show password"}
            >
              {showCurrent ? (
                <Eye className="size-5 stroke-[1.8]" />
              ) : (
                <EyeOff className="size-5 stroke-[1.8]" />
              )}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-xs text-red-500 mt-1">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        {/* New Password Field */}
        <div>
          <label
            htmlFor="newPassword"
            className="block text-base sm:text-lg font-normal text-neutral-900 mb-2"
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={showNew ? "text" : "password"}
              placeholder="••••••••••••"
              disabled={isPending}
              className="w-full h-[52px] rounded-md border border-neutral-700/80 bg-white px-4 pr-12 text-sm sm:text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200] transition-colors"
              {...register("newPassword")}
            />
            <button
              type="button"
              onClick={() => setShowNew((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-700 hover:text-neutral-900 focus:outline-none cursor-pointer"
              aria-label={showNew ? "Hide password" : "Show password"}
            >
              {showNew ? (
                <Eye className="size-5 stroke-[1.8]" />
              ) : (
                <EyeOff className="size-5 stroke-[1.8]" />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-xs text-red-500 mt-1">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Confirm New Password Field */}
        <div>
          <label
            htmlFor="confirmNewPassword"
            className="block text-base sm:text-lg font-normal text-neutral-900 mb-2"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirmNewPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••••••"
              disabled={isPending}
              className="w-full h-[52px] rounded-md border border-neutral-700/80 bg-white px-4 pr-12 text-sm sm:text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200] transition-colors"
              {...register("confirmNewPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-700 hover:text-neutral-900 focus:outline-none cursor-pointer"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? (
                <Eye className="size-5 stroke-[1.8]" />
              ) : (
                <EyeOff className="size-5 stroke-[1.8]" />
              )}
            </button>
          </div>
          {errors.confirmNewPassword && (
            <p className="text-xs text-red-500 mt-1">
              {errors.confirmNewPassword.message}
            </p>
          )}
        </div>

        {/* Action Button: Save Changes */}
        <div className="flex items-center justify-center pt-6">
          <Button
            type="submit"
            disabled={isPending}
            className="px-14 py-3 h-12 font-medium text-sm sm:text-base rounded-md bg-[#ff6200] hover:bg-[#e65800] text-white transition-colors min-w-[170px] shadow-none cursor-pointer"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
