import { getApiErrorMessage } from "@/api/client";
import verificationService from "@/api/services/verification.service";
import { Button } from "@/components/ui/button";
import OtpInput from "@/components/ui/otp-input";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, CheckCircle2, Loader2, RotateCw } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

export const VerifyOtpPage: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve email from navigation state or URL query
  const queryEmail = new URLSearchParams(location.search).get("email") || "";
  const stateEmail = (location.state as { email?: string })?.email || "";
  const email = (stateEmail || queryEmail).trim();

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60);

  // If already authenticated with VENDOR role, redirect to dashboard
  if (!isLoading && isAuthenticated && user?.role === "VENDOR") {
    return <Navigate to="/dashboard" replace />;
  }

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (submittedOtp: string = otp) => {
    if (!email) {
      setErrorMessage("No email specified. Please navigate from registration or login.");
      return;
    }

    if (submittedOtp.length !== 5) {
      setErrorMessage("Please enter all 5 numeric digits of your verification code.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsVerifying(true);

    try {
      const response = await verificationService.verifyOtp({
        email,
        otp: submittedOtp,
      });

      toast.success(response.message || "Email verified successfully!");
      setSuccessMessage("Email verified successfully! Redirecting you to login...");

      setTimeout(() => {
        navigate(`/login?email=${encodeURIComponent(email)}`, { replace: true });
      }, 1500);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending || !email) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsResending(true);

    try {
      const response = await verificationService.resendOtp({ email });
      toast.success(response.message || "A new 5-digit verification code has been sent to your email.");
      setSuccessMessage("A fresh verification code has been sent to your inbox.");
      setCooldown(60);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#461801] p-4 font-sans select-none relative overflow-hidden">
      {/* Background radial gradient glow for subtle depth */}
      <div className="absolute inset-0 bg-radial from-[#5c2102]/60 via-[#461801] to-[#331100] pointer-events-none" />

      {/* Main Verify Card */}
      <div className="relative z-10 w-full max-w-[440px] bg-[#CA4E01] rounded-[28px] border-2 border-white/90 p-8 sm:p-10 shadow-2xl text-white">
        {/* Header */}
        <div className="text-center space-y-1.5 mb-8">
          <h1 className="text-2xl sm:text-[26px] font-bold text-white tracking-tight">
            Verify Your Email
          </h1>
          <p className="text-xs sm:text-[13px] text-white/90 font-normal">
            Enter the 5-digit verification code sent to
          </p>
          <p className="text-sm font-bold text-white mt-1 break-all bg-white/20 px-3 py-1 rounded-lg inline-block">
            {email || "your email address"}
          </p>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="mb-6 p-3 rounded-xl bg-white/20 border border-white/40 text-white text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-white" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-500/30 border border-emerald-300/40 text-white text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* OTP Input Form */}
        <div className="space-y-6">
          <OtpInput
            value={otp}
            onChange={(val) => {
              setOtp(val);
              if (errorMessage) setErrorMessage(null);
            }}
            length={5}
            disabled={isVerifying}
            hasError={!!errorMessage}
            onComplete={(fullOtp) => handleVerify(fullOtp)}
          />

          <Button
            type="button"
            onClick={() => handleVerify()}
            disabled={isVerifying || otp.length !== 5}
            className="w-full h-11 sm:h-12 rounded-xl bg-white hover:bg-white/90 text-[#CA4E01] font-bold text-base transition-all shadow-md cursor-pointer disabled:opacity-60"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#CA4E01]" />
                <span>Verifying Code...</span>
              </>
            ) : (
              <span>Verify & Continue</span>
            )}
          </Button>

          {/* Resend OTP Section */}
          <div className="text-center pt-2">
            <p className="text-xs text-white/80">
              Didn't receive the verification code?
            </p>
            <Button
              type="button"
              variant="ghost"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending || !email}
              className="mt-2 text-xs font-bold text-white hover:bg-white/10 h-8 px-3 rounded-xl cursor-pointer"
            >
              {isResending ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin mr-1.5 text-white" />
                  <span>Resending...</span>
                </>
              ) : cooldown > 0 ? (
                <span className="text-white/70">Resend code in {cooldown}s</span>
              ) : (
                <span className="underline">Resend Code</span>
              )}
            </Button>
          </div>

          {/* Return to Login */}
          <div className="pt-4 border-t border-white/20 text-center">
            <Link
              to="/login"
              className="text-xs text-white/90 hover:text-white font-medium"
            >
              Return to <span className="font-bold underline text-white">Vendor Login</span>
            </Link>
          </div>
        </div>
      </div>

      <Toaster position="bottom-right" richColors />
    </div>
  );
};

export default VerifyOtpPage;
