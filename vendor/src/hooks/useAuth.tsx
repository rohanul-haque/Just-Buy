import authService from "@/api/services/auth.service";
import vendorService from "@/api/services/vendor.service";
import type { IUser } from "@/types/user";
import type { IVendor } from "@/types/vendor";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: IUser | null;
  vendorProfile: IVendor | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [vendorProfile, setVendorProfile] = useState<IVendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const [userRes, vendorRes] = await Promise.allSettled([
        authService.getMe(),
        vendorService.getOwnProfile(),
      ]);

      if (userRes.status === "fulfilled" && userRes.value?.data) {
        setUser(userRes.value.data);
      }

      if (vendorRes.status === "fulfilled" && vendorRes.value?.data) {
        setVendorProfile(vendorRes.value.data);
        if (vendorRes.value.data.vendor) {
          setUser(vendorRes.value.data.vendor);
        }
      }
    } catch {
      // Keep existing state or silently ignore on initial load
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();

    const handleUnauthorized = () => {
      setUser(null);
      setVendorProfile(null);
      localStorage.removeItem("jus_buy_vendor_token");
      setIsLoading(false);
    };

    window.addEventListener("vendor:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("vendor:unauthorized", handleUnauthorized);
    };
  }, [fetchProfile]);

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setVendorProfile(null);
      localStorage.removeItem("jus_buy_vendor_token");
    }
  };

  const value: AuthContextType = {
    user,
    vendorProfile,
    isAuthenticated: !!user,
    isLoading,
    logout,
    refreshProfile: fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;
