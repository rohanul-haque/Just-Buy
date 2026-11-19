import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import JusBuyLogo from "@/components/layout/JusBuyLogo";
import { getApiErrorMessage } from "@/api/client";
import { toast } from "sonner";

export const LoginPage: React.FC = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
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
      navigate("/dashboard", { replace: true });
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
      <div className="w-full max-w-md bg-white rounded-[16px] p-8 md:p-[28px] border border-[#E5E7EB]">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4">
            <JusBuyLogo />
          </div>
          <div className="inline-block px-3 py-1 bg-[#E0E7FF] text-[#4F46E5] text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
            Admin Portal
          </div>
          <p className="text-sm text-[#4B5563]">
            Sign in to manage vendors, categories, orders & platform earnings
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-6 p-3 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs text-center font-medium">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-xs font-semibold text-[#111827] block"
            >
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#4B5563] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jusbuy.com"
                disabled={isSubmitting}
                className="w-full pl-11 pr-4 py-2 rounded-full border border-[#E5E7EB] text-base text-[#0F172A] placeholder:text-[#4B5563] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-xs font-semibold text-[#111827] block"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#4B5563] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isSubmitting}
                className="w-full pl-11 pr-4 py-2 rounded-full border border-[#E5E7EB] text-base text-[#0F172A] placeholder:text-[#4B5563] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 py-2 px-5 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium text-sm transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-[#4B5563]">
          Jus Buy Multi-Vendor Platform © {new Date().getFullYear()} • Secure Admin Zone
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
