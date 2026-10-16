"use client";

/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * React Module
*/
import React, { useState } from "react";

/**
 * Next.js Components
*/
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Third-Party Components
*/
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Zod Validation Schema
*/
import { registerSchema, type RegisterFormData } from "@/schemas/auth.schema";

/**
 * Service Layer
*/
import { authService, getApiErrorMessage } from "@/services/auth.service";

/**
 * Register Form Component
*/
export function RegisterForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "buyer",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const selectedRole = watch("role");

  const registerMutation = useMutation({
    mutationFn: (data: RegisterFormData) =>
      authService.register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
      }),
    onSuccess: () => {
      setErrorMessage(null);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1500);
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      setErrorMessage(message);
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    setErrorMessage(null);
    registerMutation.mutate(data);
  };

  return (
    <div className="w-full">
      {/* Centered JustBuy Logo */}
      <div className="flex justify-center mb-4">
        <Link href="/" aria-label="JustBuy Home" className="transition-opacity hover:opacity-90">
          <Image
            src="/logo.svg"
            alt="JustBuy"
            width={180}
            height={58}
            priority
            className="h-10 sm:h-11 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Role Selector: As a Buyer / Seller */}
      <div className="flex items-center justify-center gap-6 mb-5 select-none">
        {/* As a Buyer Option */}
        <label
          onClick={() => setValue("role", "buyer")}
          className="inline-flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium text-[#242426]"
        >
          <span
            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
              selectedRole === "buyer"
                ? "border-[#FF5A0A] bg-white"
                : "border-neutral-400 bg-white"
            }`}
          >
            {selectedRole === "buyer" && (
              <span className="w-2 h-2 rounded-full bg-[#FF5A0A]" />
            )}
          </span>
          <span className={selectedRole === "buyer" ? "text-[#FF5A0A] font-semibold" : "text-neutral-700"}>
            As a Buyer
          </span>
        </label>

        {/* Seller Option */}
        <label
          onClick={() => setValue("role", "seller")}
          className="inline-flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium text-[#242426]"
        >
          <span
            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
              selectedRole === "seller"
                ? "border-[#FF5A0A] bg-white"
                : "border-neutral-400 bg-white"
            }`}
          >
            {selectedRole === "seller" && (
              <span className="w-2 h-2 rounded-full bg-[#FF5A0A]" />
            )}
          </span>
          <span className={selectedRole === "seller" ? "text-[#FF5A0A] font-semibold" : "text-neutral-700"}>
            Seller
          </span>
        </label>
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div
          role="status"
          className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Account created successfully! Redirecting to login...</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Form Fields matching Screenshot */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-3.5" noValidate>
        {/* Full Name */}
        <div className="space-y-1">
          <Label htmlFor="fullName" className="text-xs font-medium text-[#242426]">
            Full Name
          </Label>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            disabled={registerMutation.isPending || isSuccess}
            placeholder="Enter your name"
            className="h-9 sm:h-10 rounded-lg border-neutral-300 bg-white/90 px-3 text-xs sm:text-sm text-[#242426] placeholder:text-neutral-400 focus-visible:border-[#FF5A0A] focus-visible:ring-1 focus-visible:ring-[#FF5A0A]"
            aria-invalid={!!errors.fullName}
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="text-[11px] text-red-500 font-medium">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <Label htmlFor="email" className="text-xs font-medium text-[#242426]">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            disabled={registerMutation.isPending || isSuccess}
            placeholder="... @gmail.com"
            className="h-9 sm:h-10 rounded-lg border-neutral-300 bg-white/90 px-3 text-xs sm:text-sm text-[#242426] placeholder:text-neutral-400 focus-visible:border-[#FF5A0A] focus-visible:ring-1 focus-visible:ring-[#FF5A0A]"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-[11px] text-red-500 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <Label htmlFor="password" className="text-xs font-medium text-[#242426]">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              disabled={registerMutation.isPending || isSuccess}
              placeholder="Enter your password"
              className="h-9 sm:h-10 rounded-lg border-neutral-300 bg-white/90 pl-3 pr-9 text-xs sm:text-sm text-[#242426] placeholder:text-neutral-400 focus-visible:border-[#FF5A0A] focus-visible:ring-1 focus-visible:ring-[#FF5A0A]"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={registerMutation.isPending || isSuccess}
              className="absolute right-0 top-0 h-9 sm:h-10 w-9 flex items-center justify-center text-neutral-400 hover:text-[#FF5A0A] transition-colors focus:outline-hidden disabled:opacity-50 cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-red-500 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <Label htmlFor="confirmPassword" className="text-xs font-medium text-[#242426]">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              disabled={registerMutation.isPending || isSuccess}
              placeholder="Enter your password"
              className="h-9 sm:h-10 rounded-lg border-neutral-300 bg-white/90 pl-3 pr-9 text-xs sm:text-sm text-[#242426] placeholder:text-neutral-400 focus-visible:border-[#FF5A0A] focus-visible:ring-1 focus-visible:ring-[#FF5A0A]"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              disabled={registerMutation.isPending || isSuccess}
              className="absolute right-0 top-0 h-9 sm:h-10 w-9 flex items-center justify-center text-neutral-400 hover:text-[#FF5A0A] transition-colors focus:outline-hidden disabled:opacity-50 cursor-pointer"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[11px] text-red-500 font-medium">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit Button: SIGN UP */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={registerMutation.isPending || isSuccess}
            className="w-full h-10 sm:h-11 bg-[#FF5A0A] hover:bg-[#E54F04] text-white font-bold text-xs sm:text-sm tracking-wider rounded-lg transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer uppercase shadow-xs"
          >
            {registerMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                SIGNING UP...
              </span>
            ) : (
              "SIGN UP"
            )}
          </Button>
        </div>

        {/* Footer Link */}
        <div className="text-center pt-1.5">
          <p className="text-xs text-neutral-600">
            Already have an account ?{" "}
            <Link
              href="/login"
              className="font-medium text-[#FF5A0A] hover:underline transition-colors"
            >
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
