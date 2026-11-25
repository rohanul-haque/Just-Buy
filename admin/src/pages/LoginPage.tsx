import { getApiErrorMessage } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
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

  // If already authenticated with ADMIN role, redirect to originally intended page
  if (!isLoading && isAuthenticated && user?.role === "ADMIN") {
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
      toast.success("Welcome back to Jus Buy Admin!");
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#461801] p-4 font-sans select-none relative overflow-hidden">
      {/* Background radial gradient glow for subtle depth */}
      <div className="absolute inset-0 bg-radial from-[#5c2102]/60 via-[#461801] to-[#331100] pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-[440px] bg-[#CA4E01] rounded-[28px] border-2 border-white/90 p-8 sm:p-10 shadow-2xl text-white">
        {/* Header */}
        <div className="text-center space-y-1.5 mb-8">
          <h1 className="text-2xl sm:text-[26px] font-bold text-white tracking-tight">
            Login to Account
          </h1>
          <p className="text-xs sm:text-[13px] text-white/90 font-normal">
            Please enter your email and password to continue
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-6 p-3 rounded-xl bg-white/20 border border-white/40 text-white text-xs text-center font-medium shadow-xs">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5 text-left">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-white block pl-0.5"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isSubmitting || isLoading}
              className="h-11 sm:h-12 rounded-xl bg-white text-[#1F2937] placeholder:text-[#9CA3AF] text-sm px-4 border-none shadow-inner focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5 text-left">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-white block pl-0.5"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isSubmitting || isLoading}
              className="h-11 sm:h-12 rounded-xl bg-white text-[#1F2937] placeholder:text-[#9CA3AF] text-sm px-4 border-none shadow-inner focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            />
          </div>

          {/* Login Button */}
          <div className="pt-3">
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full h-11 sm:h-12 rounded-xl bg-white hover:bg-white/90 text-[#CA4E01] font-bold text-base transition-all shadow-md cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#CA4E01]" />
                  <span>Logging in...</span>
                </>
              ) : (
                "Login"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
