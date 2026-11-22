import apiClient from "@/api/client";
import type { ApiResponse } from "@/types/api";
import type { IUser } from "@/types/user";

export const userService = {
  updateUser: async (data: { name: string }): Promise<ApiResponse<IUser>> => {
    const response = await apiClient.patch<ApiResponse<IUser>>(
      "/users/me",
      data,
    );
    return response.data;
  },
};

export default userService;
