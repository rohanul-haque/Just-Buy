"use client";

/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

import { AuthHeader } from "@/components/auth/auth-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/schemas/auth.schema";
import { authService, getApiErrorMessage } from "@/services/auth.service";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordFormData) =>
      authService.forgotPassword(data),
    onSuccess: (_, variables) => {
      setErrorMessage(null);
      // Navigate to verify-otp passing email as query param safely
      router.push(`/verify-otp?email=${encodeURIComponent(variables.email)}`);
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      setErrorMessage(message);
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    setErrorMessage(null);
    forgotPasswordMutation.mutate(data);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <AuthHeader
        title="Forgot Password?"
        subtitle="Enter your details below to request your account password reset."
        showLogo={true}
      />

      {/* Error Message */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-sm animate-in fade-in duration-200"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
          <div className="flex-1 text-xs sm:text-sm font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Email Field */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-[#242426]">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            disabled={forgotPasswordMutation.isPending}
            placeholder="example@gmail.com"
            className="h-11 rounded-xl px-3.5 border-neutral-200 bg-white text-[#242426] placeholder:text-neutral-400 focus-visible:border-[#FF5A0A] focus-visible:ring-[#FF5A0A]/20 transition-all text-sm"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-500 font-medium mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={forgotPasswordMutation.isPending}
            className="w-full h-11 bg-[#FF5A0A] hover:bg-[#E04E07] text-white font-semibold rounded-xl text-sm shadow-sm transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {forgotPasswordMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending verification code...
              </span>
            ) : (
              "Submit"
            )}
          </Button>
        </div>

        {/* Return to Login Link */}
        <div className="text-center pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-neutral-500 hover:text-[#FF5A0A] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Return to login</span>
          </Link>
        </div>
      </form>
    </div>
  );
}
