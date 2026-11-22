import apiClient from "@/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  IOrder,
  IOrderStatistics,
  OrderStatus,
  OrderType,
  PaymentStatus,
} from "@/types/order";

export interface GetVendorOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus | string;
  orderType?: OrderType | string;
  paymentStatus?: PaymentStatus | string;
  paymentMethod?: OrderType | string;
  search?: string;
  sortBy?: "createdAt" | "totalAmount" | "subtotal" | "status" | string;
  sortOrder?: "asc" | "desc";
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

  getVendorOrderStatistics: async (): Promise<
    ApiResponse<IOrderStatistics>
  > => {
    try {
      const response = await apiClient.get<ApiResponse<IOrderStatistics>>(
        "/orders/vendor/statistics",
      );
      if (response.data && response.data.success && response.data.data) {
        return response.data;
      }
      throw new Error("Statistics endpoint returned empty data");
    } catch {
      // Fallback: Query vendor order totals in parallel
      const [all, cancelled, delivered, shipped, online, cod] =
        await Promise.all([
          apiClient.get<ApiResponse<any>>("/orders/vendor/orders?limit=1"),
          apiClient.get<ApiResponse<any>>(
            "/orders/vendor/orders?status=CANCELLED&limit=1",
          ),
          apiClient.get<ApiResponse<any>>(
            "/orders/vendor/orders?status=DELIVERED&limit=1",
          ),
          apiClient.get<ApiResponse<any>>(
            "/orders/vendor/orders?status=SHIPPED&limit=1",
          ),
          apiClient.get<ApiResponse<any>>(
            "/orders/vendor/orders?orderType=ONLINE&limit=1",
          ),
          apiClient.get<ApiResponse<any>>(
            "/orders/vendor/orders?orderType=COD&limit=1",
          ),
        ]);

      return {
        success: true,
        statusCode: 200,
        message: "Vendor statistics fetched successfully",
        data: {
          totalOrders: all.data?.pagination?.total ?? 0,
          cancelledOrders: cancelled.data?.pagination?.total ?? 0,
          deliveredOrders: delivered.data?.pagination?.total ?? 0,
          shippingOrders: shipped.data?.pagination?.total ?? 0,
          onlinePayments: online.data?.pagination?.total ?? 0,
          offlinePayments: cod.data?.pagination?.total ?? 0,
        },
      };
    }
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

  updatePaymentStatus: async (
    orderId: string,
    status: PaymentStatus,
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.patch<ApiResponse<any>>(
      `/orders/${orderId}/payment/status`,
      { status },
    );
    return response.data;
  },
};

export default orderService;
