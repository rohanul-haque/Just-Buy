import { getApiErrorMessage } from "@/api/client";
import authService from "@/api/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { toast } from "sonner";

export const RegisterPage: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated with VENDOR role, redirect to dashboard
  if (!isLoading && isAuthenticated && user?.role === "VENDOR") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (trimmedName.length < 2) {
      setErrorMessage("Name must be at least 2 characters.");
      return;
    }

    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await authService.register({
        name: trimmedName,
        email: trimmedEmail,
        password,
      });

      toast.success(
        response.message ||
          "Registration successful! Please verify your email with the 5-digit code.",
      );
      navigate(`/verify-otp?email=${encodeURIComponent(trimmedEmail)}`, {
        state: { email: trimmedEmail },
        replace: true,
      });
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#461801] p-4 font-sans select-none relative overflow-hidden">
      {/* Background radial gradient glow for subtle depth */}
      <div className="absolute inset-0 bg-radial from-[#5c2102]/60 via-[#461801] to-[#331100] pointer-events-none" />

      {/* Main Register Card */}
      <div className="relative z-10 w-full max-w-[440px] bg-[#CA4E01] rounded-[28px] border-2 border-white/90 p-8 sm:p-10 shadow-2xl text-white">
        {/* Header */}
        <div className="text-center space-y-1.5 mb-8">
          <h1 className="text-2xl sm:text-[26px] font-bold text-white tracking-tight">
            Create Account
          </h1>
          <p className="text-xs sm:text-[13px] text-white/90 font-normal">
            Please enter your details to create a vendor account
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-6 p-3 rounded-xl bg-white/20 border border-white/40 text-white text-xs text-center font-medium shadow-xs">
            {errorMessage}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5 text-left">
            <label
              htmlFor="vendor-register-name"
              className="text-sm font-semibold text-white block pl-0.5"
            >
              Full Name
            </label>
            <Input
              id="vendor-register-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              disabled={isSubmitting}
              className="h-11 sm:h-12 rounded-xl bg-white text-[#1F2937] placeholder:text-[#9CA3AF] text-sm px-4 border-none shadow-inner focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5 text-left">
            <label
              htmlFor="vendor-register-email"
              className="text-sm font-semibold text-white block pl-0.5"
            >
              Email
            </label>
            <Input
              id="vendor-register-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isSubmitting}
              className="h-11 sm:h-12 rounded-xl bg-white text-[#1F2937] placeholder:text-[#9CA3AF] text-sm px-4 border-none shadow-inner focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5 text-left">
            <label
              htmlFor="vendor-register-password"
              className="text-sm font-semibold text-white block pl-0.5"
            >
              Password
            </label>
            <Input
              id="vendor-register-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isSubmitting}
              className="h-11 sm:h-12 rounded-xl bg-white text-[#1F2937] placeholder:text-[#9CA3AF] text-sm px-4 border-none shadow-inner focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            />
          </div>

          {/* Create Account Button */}
          <div className="pt-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 sm:h-12 rounded-xl bg-white hover:bg-white/90 text-[#CA4E01] font-bold text-base transition-all shadow-md cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#CA4E01]" />
                  <span>Creating Account...</span>
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </form>

        {/* Link to Login */}
        <div className="mt-8 text-center text-xs text-white/80">
          Already have a vendor account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-bold text-white hover:underline cursor-pointer ml-1"
          >
            Login
          </button>
        </div>
      </div>

      <Toaster richColors position="bottom-right" />
    </div>
  );
};

export default RegisterPage;
