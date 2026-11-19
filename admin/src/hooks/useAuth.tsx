import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import authService, { type ILoginResponse } from "@/api/services/auth.service";
import type { IAdminProfile, IUser } from "@/types/user";

interface AuthContextType {
  user: IUser | null;
  adminProfile: IAdminProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<ILoginResponse>;
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
      const [userRes, profileRes] = await Promise.allSettled([
        authService.getMe(),
        authService.getAdminProfile(),
      ]);

      if (userRes.status === "fulfilled" && userRes.value?.data) {
        setUser(userRes.value.data);
      }
      if (profileRes.status === "fulfilled" && profileRes.value?.data) {
        setAdminProfile(profileRes.value.data);
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
      setUser(res.data.user);
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
    }
  };

  const value: AuthContextType = {
    user,
    adminProfile,
    isAuthenticated: !!user,
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
