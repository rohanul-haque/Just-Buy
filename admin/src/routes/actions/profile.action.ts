import { getApiErrorMessage } from "@/api/client";
import authService from "@/api/services/auth.service";
import type { IAdminProfile } from "@/types/user";
import type { ActionFunction } from "react-router";

export interface ProfileActionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: IAdminProfile;
}

export const profileAction: ActionFunction = async ({
  request,
}): Promise<ProfileActionResult> => {
  try {
    const formData = await request.formData();
    const response = await authService.updateAdminProfile(formData);
    return {
      success: true,
      message: response.message || "Admin profile updated successfully!",
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: getApiErrorMessage(error),
    };
  }
};

export default profileAction;
