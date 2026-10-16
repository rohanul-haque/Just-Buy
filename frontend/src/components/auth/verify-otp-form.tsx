"use client";

/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Loader2, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";

import { AuthHeader } from "@/components/auth/auth-header";
import { Button } from "@/components/ui/button";
import { authService, getApiErrorMessage } from "@/services/auth.service";

export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(60);
  const [isResendActive, setIsResendActive] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input box on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Resend Countdown Timer
  useEffect(() => {
    if (countdown <= 0) {
      setIsResendActive(true);
      return;
    }

    setIsResendActive(false);
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Verify OTP Mutation
  const verifyMutation = useMutation({
    mutationFn: (code: string) => authService.verifyOtp({ email, otp: code }),
    onSuccess: (_, code) => {
      setErrorMessage(null);
      // Navigate to /reset-password passing email and verified OTP safely
      const targetUrl = `/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(code)}`;
      router.push(targetUrl);
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      setErrorMessage(message);
    },
  });

  // Resend OTP Mutation
  const resendMutation = useMutation({
    mutationFn: () => authService.resendOtp({ email }),
    onSuccess: () => {
      setErrorMessage(null);
      setSuccessNotice("A new 6-digit verification code has been sent to your email.");
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      setErrorMessage(message);
    },
  });

  // Handle Input Changes
  const handleInputChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "");

    // If empty
    if (!digit) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    // Set the digit
    const newOtp = [...otp];
    newOtp[index] = digit.slice(-1);
    setOtp(newOtp);
    setErrorMessage(null);

    // Auto-advance to next input
    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace & Keyboard Navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Current box is empty, move back and clear previous
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current box
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Paste
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    const digitsOnly = pastedData.replace(/\D/g, "").slice(0, 6);

    if (digitsOnly.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < digitsOnly.length; i++) {
        newOtp[i] = digitsOnly[i];
      }
      setOtp(newOtp);
      setErrorMessage(null);

      // Focus the next empty box or the last box
      const targetIndex = Math.min(digitsOnly.length, 5);
      inputRefs.current[targetIndex]?.focus();
    }
  }, [otp]);

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");

    if (code.length < 6) {
      setErrorMessage("Please enter all 6 digits of the verification code.");
      return;
    }

    setErrorMessage(null);
    verifyMutation.mutate(code);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <AuthHeader
        title="Verify OTP"
        subtitle="We'll send a verification code to your email. Check your inbox and enter the code here."
        showLogo={true}
      />

      {/* Target Email Banner */}
      {email && (
        <div className="mb-5 px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between text-xs sm:text-sm">
          <span className="text-neutral-500">
            Code sent to: <strong className="text-[#242426] font-medium">{email}</strong>
          </span>
          <Link
            href="/forgot-password"
            className="text-xs text-[#FF5A0A] hover:underline font-medium"
          >
            Change
          </Link>
        </div>
      )}

      {/* Success Notice */}
      {successNotice && (
        <div
          role="status"
          className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs sm:text-sm animate-in fade-in duration-200"
        >
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
          <div className="flex-1 font-medium">{successNotice}</div>
        </div>
      )}

      {/* Error Notice */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs sm:text-sm animate-in fade-in duration-200"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* OTP Form */}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* 6 Digit Input Group */}
        <div>
          <fieldset className="flex justify-between items-center gap-2 sm:gap-3">
            <legend className="sr-only">6-digit verification code</legend>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                id={`otp-input-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                disabled={verifyMutation.isPending}
                aria-label={`Digit ${index + 1} of 6`}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-xl border bg-white text-[#242426] transition-all outline-hidden
                  ${
                    digit
                      ? "border-[#FF5A0A] ring-2 ring-[#FF5A0A]/20 bg-[#FFF9F5]"
                      : "border-neutral-200 focus:border-[#FF5A0A] focus:ring-2 focus:ring-[#FF5A0A]/20"
                  }
                  ${
                    errorMessage
                      ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                      : ""
                  }
                  disabled:opacity-50 disabled:bg-neutral-50
                `}
              />
            ))}
          </fieldset>
        </div>

        {/* Resend Action with Countdown */}
        <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
          <span className="text-neutral-500">Didn&apos;t receive code?</span>
          {isResendActive ? (
            <button
              type="button"
              disabled={resendMutation.isPending}
              onClick={() => resendMutation.mutate()}
              className="inline-flex items-center gap-1.5 font-semibold text-[#FF5A0A] hover:text-[#E04E07] hover:underline transition-colors disabled:opacity-50 cursor-pointer"
            >
              {resendMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  Resend OTP
                </>
              )}
            </button>
          ) : (
            <span className="font-medium text-neutral-400">
              Resend in <span className="text-[#FF5A0A] font-semibold">{formatTime(countdown)}</span>
            </span>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <Button
            type="submit"
            disabled={verifyMutation.isPending || otp.join("").length < 6}
            className="w-full h-11 bg-[#FF5A0A] hover:bg-[#E04E07] text-white font-semibold rounded-xl text-sm shadow-sm transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {verifyMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying code...
              </span>
            ) : (
              "Verify OTP"
            )}
          </Button>
        </div>

        {/* Back Link */}
        <div className="text-center pt-2">
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-neutral-500 hover:text-[#FF5A0A] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to email entry</span>
          </Link>
        </div>
      </form>
    </div>
  );
}
