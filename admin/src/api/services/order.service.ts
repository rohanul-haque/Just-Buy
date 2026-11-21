import apiClient from "@/api/client";
import type { ApiResponse, PaginationParams } from "@/types/api";
import type { IOrder } from "@/types/order";

export const orderService = {
  getAllOrders: async (
    params?: PaginationParams,
  ): Promise<ApiResponse<IOrder[]>> => {
    const response = await apiClient.get<ApiResponse<IOrder[]>>("/orders", {
      params,
    });
    return response.data;
  },

  getOrderById: async (id: string): Promise<ApiResponse<IOrder>> => {
    const response = await apiClient.get<ApiResponse<IOrder>>(`/orders/${id}`);
    return response.data;
  },

  getDashboardMetrics: async () => {
    const [ordersRes, buyersRes, vendorsRes, productsRes] =
      await Promise.allSettled([
        apiClient.get<ApiResponse<IOrder[]>>("/orders?limit=100"),
        apiClient.get<ApiResponse<any[]>>("/buyers?limit=1"),
        apiClient.get<ApiResponse<any[]>>("/vendors?limit=1"),
        apiClient.get<ApiResponse<any[]>>("/products?limit=1"),
      ]);

    let totalEarnings = 0;
    let recentOrders: IOrder[] = [];
    let totalOrders = 0;

    if (ordersRes.status === "fulfilled") {
      const ordersData = ordersRes.value.data?.data || [];
      recentOrders = ordersData.slice(0, 5);
      totalOrders = ordersRes.value.data?.pagination?.total || ordersData.length;

      // Calculate total platform earnings directly from real order commission fields
      ordersData.forEach((order) => {
        const items = order.productItems || order.items || [];
        items.forEach((item) => {
          totalEarnings += Number(item.adminCommission) || 0;
        });
      });
    }

    const totalUsers =
      buyersRes.status === "fulfilled"
        ? buyersRes.value.data?.pagination?.total ?? 0
        : 0;

    const totalVendors =
      vendorsRes.status === "fulfilled"
        ? vendorsRes.value.data?.pagination?.total ?? 0
        : 0;

    const totalProducts =
      productsRes.status === "fulfilled"
        ? (productsRes.value.data as any)?.meta?.total ??
          (productsRes.value.data as any)?.pagination?.total ??
          0
        : 0;

    return {
      totalEarnings,
      totalOrders,
      totalUsers,
      totalVendors,
      totalProducts,
      recentOrders,
    };
  },
};

export default orderService;
