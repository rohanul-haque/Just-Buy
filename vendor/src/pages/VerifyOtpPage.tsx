import { getApiErrorMessage } from "@/api/client";
import verificationService from "@/api/services/verification.service";
import JusBuyLogo from "@/components/layout/JusBuyLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
      <Card className="w-full max-w-md bg-white rounded-md p-8 md:p-10 border border-[#E5E7EB] shadow-xs">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4">
            <JusBuyLogo />
          </div>
          <Badge className="bg-[#E0E7FF] text-[#4F46E5] hover:bg-[#E0E7FF] border-none text-xs font-semibold rounded-md uppercase tracking-wider mb-2 px-3 py-1">
            Vendor Verification
          </Badge>
          <h2 className="text-xl font-bold text-[#0F172A] mt-2">
            Verify Your Email
          </h2>
          <p className="text-sm text-[#4B5563] mt-1">
            Enter the 5-digit verification code sent to
          </p>
          <p className="text-sm font-semibold text-[#0F172A] mt-0.5 break-all">
            {email || "your email address"}
          </p>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="mb-6 p-3 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-3 rounded-md bg-[#10B981]/10 border border-[#10B981]/20 text-[#059669] text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
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
            className="w-full h-11 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-md font-medium text-sm transition-all duration-200 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Verifying Code...</span>
              </>
            ) : (
              <span>Verify & Continue</span>
            )}
          </Button>

          {/* Resend OTP Section */}
          <div className="text-center pt-2">
            <p className="text-xs text-[#64748B]">
              Didn't receive the verification code?
            </p>
            <Button
              type="button"
              variant="ghost"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending || !email}
              className="mt-2 text-xs font-medium text-[#4F46E5] hover:text-[#4338CA] hover:bg-[#EEF2FF] h-8 px-3 rounded-md"
            >
              {isResending ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  <span>Resending...</span>
                </>
              ) : cooldown > 0 ? (
                <span>Resend code in {cooldown}s</span>
              ) : (
                <span className="font-semibold underline cursor-pointer">Resend Code</span>
              )}
            </Button>
          </div>

          {/* Return to Login */}
          <div className="pt-4 border-t border-[#E5E7EB] text-center">
            <Link
              to="/login"
              className="text-xs text-[#64748B] hover:text-[#0F172A] font-medium"
            >
              Return to <span className="text-[#4F46E5] font-semibold underline">Vendor Login</span>
            </Link>
          </div>
        </div>
      </Card>

      <Toaster position="bottom-right" richColors />
    </div>
  );
};

export default VerifyOtpPage;
