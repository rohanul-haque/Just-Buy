"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, RotateCw } from "lucide-react";
import { OtpInput } from "@/components/ui/otp-input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
  useVerifyOtp,
  useResendOtp,
} from "@/features/auth/hooks/use-auth";
import type { ApiErrorResponse } from "@/lib/api-error";
import notify from "@/lib/toast";

export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailParam = searchParams.get("email") || "";

  const [otp, setOtp] = React.useState("");
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null,
  );
  const [cooldown, setCooldown] = React.useState(60);

  const verifyMutation = useVerifyOtp();
  const resendMutation = useResendOtp();

  // Cooldown countdown timer effect
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = (submittedOtp: string = otp) => {
    if (submittedOtp.length !== 5) {
      setApiError("Please enter all 5 numeric digits of your verification code.");
      return;
    }

    setApiError(null);
    setSuccessMessage(null);

    verifyMutation.mutate(
      {
        email: emailParam,
        otp: submittedOtp,
      },
      {
        onSuccess: () => {
          notify.success(
            "Account verified successfully!",
            "Redirecting you to login...",
          );
          setSuccessMessage(
            "Email verified successfully! Redirecting you to login...",
          );
          setTimeout(() => {
            router.push("/login?verified=true");
          }, 1500);
        },
        onError: (err: ApiErrorResponse) => {
          const msg = err.message || "Invalid OTP code. Please try again.";
          setApiError(msg);
          notify.error(msg);
        },
      },
    );
  };

  const handleResend = () => {
    if (cooldown > 0 || resendMutation.isPending || !emailParam) return;

    setApiError(null);
    setSuccessMessage(null);

    resendMutation.mutate(
      { email: emailParam },
      {
        onSuccess: () => {
          notify.success("Verification code resent to your email.");
          setSuccessMessage("A fresh 5-digit verification code has been sent to your email.");
          setCooldown(60);
        },
        onError: (err: ApiErrorResponse) => {
          const msg =
            err.message ||
            "Failed to resend verification code. Please wait before trying again.";
          setApiError(msg);
          notify.error(msg);
        },
      },
    );
  };

  const isPending = verifyMutation.isPending || resendMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Target Email Banner */}
      {emailParam ? (
        <div className="text-center text-sm text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border">
          Verification code sent to:{" "}
          <strong className="text-foreground font-semibold">{emailParam}</strong>
        </div>
      ) : (
        <div className="text-center text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
          No email provided. Please{" "}
          <Link href="/register" className="underline font-semibold">
            register
          </Link>{" "}
          or{" "}
          <Link href="/login" className="underline font-semibold">
            sign in
          </Link>
          .
        </div>
      )}

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

      {/* 5-Box Numeric OTP Input */}
      <div className="py-2">
        <OtpInput
          value={otp}
          onChange={(val) => {
            setOtp(val);
            if (apiError) setApiError(null);
          }}
          disabled={isPending}
          hasError={!!apiError}
          onComplete={(completedOtp) => handleVerify(completedOtp)}
        />
      </div>

      {/* Verify Submit Button */}
      <Button
        type="button"
        disabled={isPending || otp.length !== 5 || !emailParam}
        onClick={() => handleVerify(otp)}
        className="w-full h-11 text-base font-semibold"
      >
        {verifyMutation.isPending ? (
          <LoadingSpinner size="sm" label="Verifying..." />
        ) : (
          "Verify Account"
        )}
      </Button>

      {/* Resend OTP Section */}
      <div className="text-center text-sm pt-2">
        <p className="text-muted-foreground mb-1.5">Didn&apos;t receive the code?</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={cooldown > 0 || isPending || !emailParam}
          onClick={handleResend}
          className="gap-2 text-primary hover:text-primary/80 font-medium"
        >
          {resendMutation.isPending ? (
            <LoadingSpinner size="sm" label="Sending..." />
          ) : cooldown > 0 ? (
            <span>Resend code in {cooldown}s</span>
          ) : (
            <>
              <RotateCw className="size-3.5" />
              <span>Resend Verification Code</span>
            </>
          )}
        </Button>
      </div>

      <div className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
        Need to change your email?{" "}
        <Link href="/register" className="text-primary hover:underline font-semibold">
          Create a different account
        </Link>
      </div>
    </div>
  );
}

