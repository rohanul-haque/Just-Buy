import apiClient from "@/api/client";
import type { ApiResponse } from "@/types/api";
import type { IOrder, OrderStatus, OrderType } from "@/types/order";

export interface GetVendorOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus | string;
  orderType?: OrderType | string;
}

export const orderService = {
  getVendorOrders: async (
    params?: GetVendorOrdersParams,
  ): Promise<ApiResponse<IOrder[]>> => {
    const response = await apiClient.get<ApiResponse<IOrder[]>>(
      "/orders/vendor/orders",
      { params },
    );
    return response.data;
  },

  getOrderById: async (id: string): Promise<ApiResponse<IOrder>> => {
    const response = await apiClient.get<ApiResponse<IOrder>>(`/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (
    orderId: string,
    status: OrderStatus,
  ): Promise<ApiResponse<IOrder>> => {
    const response = await apiClient.patch<ApiResponse<IOrder>>(
      `/orders/${orderId}/status`,
      { status },
    );
    return response.data;
  },

  confirmCODPayment: async (orderId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.patch<ApiResponse<any>>(
      `/orders/${orderId}/confirm-cod-payment`,
      {},
    );
    return response.data;
  },
};

export default orderService;
