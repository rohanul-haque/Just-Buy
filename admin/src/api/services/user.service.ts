import buyerService from "@/api/services/buyer.service";
import type { ApiResponse, PaginationParams } from "@/types/api";
import type { IBuyer } from "@/types/user";

export const userService = {
  getAllBuyers: async (
    params?: PaginationParams,
  ): Promise<ApiResponse<IBuyer[]>> => {
    return buyerService.getAllBuyers(params);
  },

  getBuyerById: async (id: string): Promise<ApiResponse<IBuyer>> => {
    return buyerService.getBuyerById(id);
  },

  updateBuyerStatus: async (
    buyerId: string,
    status: "ACTIVE" | "BLOCKED",
  ): Promise<ApiResponse<IBuyer>> => {
    return buyerService.updateBuyerStatus(buyerId, status);
  },

  deleteBuyer: async (buyerId: string): Promise<ApiResponse<IBuyer>> => {
    return buyerService.deleteBuyer(buyerId);
  },
};

export default userService;
