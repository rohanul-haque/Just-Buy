import { Toaster } from "@/components/ui/sonner";
import { getApiErrorMessage } from "@/api/client";
import authService from "@/api/services/auth.service";
import JusBuyLogo from "@/components/layout/JusBuyLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, Loader2, Lock, Mail, User } from "lucide-react";
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
          "Registration successful! Please verify your email or sign in.",
      );
      navigate("/login", { replace: true });
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
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
            Vendor Portal
          </Badge>
          <p className="text-sm text-[#4B5563]">
            Create a vendor account to start selling products on Jus Buy
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-6 p-3 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs text-center font-medium">
            {errorMessage}
          </div>
        )}

        {/* Create Account Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="vendor-register-name"
              className="text-xs font-semibold text-[#111827] block"
            >
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#4B5563] absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                id="vendor-register-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                disabled={isSubmitting}
                className="pl-9 h-10 rounded-md bg-white border-[#E5E7EB] text-sm text-[#0F172A]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="vendor-register-email"
              className="text-xs font-semibold text-[#111827] block"
            >
              Vendor Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#4B5563] absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                id="vendor-register-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vendor@example.com"
                disabled={isSubmitting}
                className="pl-9 h-10 rounded-md bg-white border-[#E5E7EB] text-sm text-[#0F172A]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="vendor-register-password"
              className="text-xs font-semibold text-[#111827] block"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#4B5563] absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                id="vendor-register-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isSubmitting}
                className="pl-9 h-10 rounded-md bg-white border-[#E5E7EB] text-sm text-[#0F172A]"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 rounded-md bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Vendor Account</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#E5E7EB] text-center text-xs text-[#4B5563]">
          Already have a vendor account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-semibold text-[#4F46E5] hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-[#4B5563]">
          Jus Buy Multi-Vendor Platform © {new Date().getFullYear()} • Secure
          Vendor Portal
        </p>
      </Card>
      <Toaster richColors position="bottom-right" />
    </div>
  );
};

export default RegisterPage;
