import authService from "@/api/services/auth.service";
import type { IAdminProfile, IUser } from "@/types/user";

export interface ProfileLoaderData {
  user: IUser | null;
  adminProfile: IAdminProfile | null;
}

export const profileLoader = async (): Promise<ProfileLoaderData> => {
  const [userRes, profileRes] = await Promise.allSettled([
    authService.getMe(),
    authService.getAdminProfile(),
  ]);

  return {
    user: userRes.status === "fulfilled" ? userRes.value?.data || null : null,
    adminProfile:
      profileRes.status === "fulfilled" ? profileRes.value?.data || null : null,
  };
};

export default profileLoader;
