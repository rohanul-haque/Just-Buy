"use client";

/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * React hooks
 */
import { useState } from "react";

/**
 * Next.js
 */
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * React hook form
 */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

/**
 * services and types
 */
import { authService, getApiErrorMessage } from "@/services/auth.service";
import { LoginPayload } from "@/types";

/**
 * Component
 */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/schemas/auth.schema";


export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginPayload) => authService.login(data),
    onSuccess: () => {
      setErrorMessage(null);
      router.push("/");
      router.refresh();
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      setErrorMessage(message);
    },
  });

  const onSubmit = (data: LoginPayload) => {
    setErrorMessage(null);
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full">
      {/* Centered JusBuy Logo */}
      <div className="flex justify-center mb-6">
        <Link href="/" aria-label="JusBuy Home" className="transition-opacity hover:opacity-90">
          <Image
            src="/logo.svg"
            alt="JusBuy"
            width={190}
            height={62}
            priority
            className="h-11 sm:h-12 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Heading */}
      <h1 className="text-xl sm:text-2xl font-bold text-center text-[#242426] mb-7 tracking-tight">
        Great to have you back !
      </h1>

      {/* API Error Notification */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Username or Email */}
        <div className="space-y-1">
          <Label
            htmlFor="email"
            className="text-xs sm:text-sm font-semibold text-[#242426]"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            disabled={loginMutation.isPending}
            placeholder="Email"
            className="h-11 rounded-lg border-neutral-300 bg-white/80 px-3.5 text-[#242426] placeholder:text-neutral-400 focus-visible:border-[#FF5A0A] focus-visible:ring-1 focus-visible:ring-[#FF5A0A] transition-all text-sm"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-600 mt-1 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-xs sm:text-sm font-semibold text-[#242426]"
            >
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs sm:text-sm text-[#FF5A0A] border-b border-[#FF5A0A] pb-0.2 hover:opacity-85 font-normal transition-opacity"
            >
              Forgot
            </Link>
          </div>

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              disabled={loginMutation.isPending}
              placeholder="Password"
              className="h-11 rounded-lg border-neutral-300 bg-white/80 pl-3.5 pr-11 text-[#242426] placeholder:text-neutral-400 focus-visible:border-[#FF5A0A] focus-visible:ring-1 focus-visible:ring-[#FF5A0A] transition-all text-sm"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={loginMutation.isPending}
              className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-neutral-400 hover:text-[#FF5A0A] transition-colors focus:outline-hidden disabled:opacity-50 cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-600 mt-1 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Don't have an account ? Register */}
        <div className="text-center py-1">
          <p className="text-xs text-neutral-600">
            Don&apos;t have an account ?{" "}
            <Link
              href="/register"
              className="font-medium text-[#FF5A0A] hover:underline transition-colors"
            >
              Register
            </Link>
          </p>
        </div>

        {/* Submit Button: SIGN IN */}
        <div className="pt-1">
          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full h-11 bg-[#FF5A0A] hover:bg-[#E54F04] text-white font-bold text-xs sm:text-sm tracking-wider rounded-lg transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer uppercase shadow-xs"
          >
            {loginMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                SIGNING IN...
              </span>
            ) : (
              "SIGN IN"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
