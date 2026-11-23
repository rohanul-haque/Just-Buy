import authService, { type ILoginResponse } from "@/api/services/auth.service";
import type { IAdminProfile, IUser } from "@/types/user";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: IUser | null;
  adminProfile: IAdminProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: {
    email: string;
    password: string;
  }) => Promise<ILoginResponse>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [adminProfile, setAdminProfile] = useState<IAdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      // Check if access token is passed via URL query params (e.g. from common frontend login)
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get("token");
        if (tokenFromUrl) {
          localStorage.setItem("jus_buy_admin_token", tokenFromUrl);
          // Clean the token parameter from URL without reloading
          urlParams.delete("token");
          const remainingQuery = urlParams.toString();
          const cleanPath = `${window.location.pathname}${remainingQuery ? `?${remainingQuery}` : ""}${window.location.hash}`;
          window.history.replaceState({}, document.title, cleanPath);
        }
      }

      const [userRes, profileRes] = await Promise.allSettled([
        authService.getMe(),
        authService.getAdminProfile(),
      ]);

      if (userRes.status === "fulfilled" && userRes.value?.data) {
        const userData = userRes.value.data;
        // Enforce admin role check strictly
        if (userData.role === "ADMIN") {
          setUser(userData);
        } else {
          setUser(null);
          localStorage.removeItem("jus_buy_admin_token");
        }
      } else {
        setUser(null);
      }

      if (profileRes.status === "fulfilled" && profileRes.value?.data) {
        setAdminProfile(profileRes.value.data);
      } else {
        setAdminProfile(null);
      }
    } catch {
      setUser(null);
      setAdminProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();

    const handleUnauthorized = () => {
      setUser(null);
      setAdminProfile(null);
      localStorage.removeItem("jus_buy_admin_token");
      setIsLoading(false);
    };

    window.addEventListener("admin:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("admin:unauthorized", handleUnauthorized);
    };
  }, [fetchProfile]);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      const loggedUser = res.data?.user;

      if (!loggedUser || loggedUser.role !== "ADMIN") {
        await authService.logout();
        throw new Error(
          "Access denied. Only platform administrators can sign in here.",
        );
      }

      setUser(loggedUser);
      await fetchProfile();
      return res.data;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setAdminProfile(null);
      localStorage.removeItem("jus_buy_admin_token");
    }
  };

  const value: AuthContextType = {
    user,
    adminProfile,
    isAuthenticated: !!user && user.role === "ADMIN",
    isLoading,
    login,
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
