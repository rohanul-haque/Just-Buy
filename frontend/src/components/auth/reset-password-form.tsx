"use client";

/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * React modules
*/
import React, { useState } from "react";

/**
 * Next.js modules
*/
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * React hook form modules
*/
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

/**
 * Tanstack query modules
*/
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * Components
*/
import { AuthHeader } from "@/components/auth/auth-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { resetPasswordSchema, type ResetPasswordFormData } from "@/schemas/auth.schema";


import { authService, getApiErrorMessage } from "@/services/auth.service";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const otp = searchParams.get("otp") || "";

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const resetMutation = useMutation({
    mutationFn: (data: ResetPasswordFormData) =>
      authService.resetPassword({
        email,
        otp,
        newPassword: data.newPassword,
      }),
    onSuccess: () => {
      setErrorMessage(null);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 2000);
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      setErrorMessage(message);
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!email || !otp) {
      setErrorMessage("Missing email or verification code. Please restart password recovery.");
      return;
    }
    setErrorMessage(null);
    resetMutation.mutate(data);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <AuthHeader
        title="Reset Password"
        subtitle="Create a new secure password for your JustBuy account."
        showLogo={true}
      />

      {/* Success State */}
      {isSuccess && (
        <div
          role="status"
          className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm animate-in fade-in"
        >
          <div className="flex items-center gap-2 font-semibold text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Password reset successful!
          </div>
          <p className="mt-1 text-xs text-emerald-700">
            Redirecting you to the login page in a moment...
          </p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-sm animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
          <div className="flex-1 text-xs sm:text-sm font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5" noValidate>
        {/* New Password */}
        <div className="space-y-1.5">
          <Label htmlFor="newPassword" className="text-xs sm:text-sm font-medium text-[#242426]">
            New Password
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              autoComplete="new-password"
              disabled={resetMutation.isPending || isSuccess}
              placeholder="At least 8 characters"
              className="h-11 rounded-xl pl-3.5 pr-11 border-neutral-200 bg-white text-[#242426] placeholder:text-neutral-400 focus-visible:border-[#FF5A0A] focus-visible:ring-[#FF5A0A]/20 transition-all text-sm"
              aria-invalid={!!errors.newPassword}
              {...register("newPassword")}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              aria-label={showNewPassword ? "Hide password" : "Show password"}
              disabled={resetMutation.isPending || isSuccess}
              className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-hidden disabled:opacity-50"
            >
              {showNewPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-xs text-red-500 font-medium mt-1">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-xs sm:text-sm font-medium text-[#242426]">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              disabled={resetMutation.isPending || isSuccess}
              placeholder="Confirm your new password"
              className="h-11 rounded-xl pl-3.5 pr-11 border-neutral-200 bg-white text-[#242426] placeholder:text-neutral-400 focus-visible:border-[#FF5A0A] focus-visible:ring-[#FF5A0A]/20 transition-all text-sm"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              disabled={resetMutation.isPending || isSuccess}
              className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-hidden disabled:opacity-50"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 font-medium mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={resetMutation.isPending || isSuccess}
            className="w-full h-11 bg-[#FF5A0A] hover:bg-[#E04E07] text-white font-semibold rounded-xl text-sm shadow-sm transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {resetMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Resetting password...
              </span>
            ) : (
              "Reset Password"
            )}
          </Button>
        </div>

        {/* Return to Login */}
        <div className="text-center pt-2">
          <Link
            href="/login"
            className="text-xs sm:text-sm font-medium text-neutral-500 hover:text-[#FF5A0A] transition-colors hover:underline"
          >
            Cancel and return to login
          </Link>
        </div>
      </form>
    </div>
  );
}
