import { Toaster } from "@/components/ui/sonner";
import { getApiErrorMessage } from "@/api/client";
import JusBuyLogo from "@/components/layout/JusBuyLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import React, { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

export const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading, login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Determine originally requested route if redirected by ProtectedRoute
  const fromLocation = (
    location.state as { from?: { pathname: string; search?: string } }
  )?.from;
  const redirectPath =
    fromLocation && fromLocation.pathname !== "/login"
      ? `${fromLocation.pathname}${fromLocation.search || ""}`
      : "/dashboard";

  // If already authenticated with VENDOR role, redirect to originally intended page
  if (!isLoading && isAuthenticated && user?.role === "VENDOR") {
    return <Navigate to={redirectPath} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login({ email: trimmedEmail, password });
      toast.success("Welcome back to Jus Buy Vendor!");
      navigate(redirectPath, { replace: true });
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
            Sign in to manage your shop, products, orders & business settings
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-6 p-3 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs text-center font-medium">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="vendor-login-email"
              className="text-xs font-semibold text-[#111827] block"
            >
              Vendor Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#4B5563] absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                id="vendor-login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vendor@example.com"
                disabled={isSubmitting || isLoading}
                className="pl-9 h-10 rounded-md bg-white border-[#E5E7EB] text-sm text-[#0F172A]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="vendor-login-password"
              className="text-xs font-semibold text-[#111827] block"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#4B5563] absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                id="vendor-login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isSubmitting || isLoading}
                className="pl-9 h-10 rounded-md bg-white border-[#E5E7EB] text-sm text-[#0F172A]"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full h-10 rounded-md bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#E5E7EB] text-center text-xs text-[#4B5563]">
          Don&apos;t have a vendor account?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="font-semibold text-[#4F46E5] hover:underline cursor-pointer"
          >
            Create an Account
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

export default LoginPage;
