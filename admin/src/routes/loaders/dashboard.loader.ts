import dashboardService from "@/api/services/dashboard.service";
import type { DashboardLoaderData } from "@/types/dashboard";
import type { LoaderFunctionArgs } from "react-router";

export const dashboardLoader = async ({
  request,
}: LoaderFunctionArgs): Promise<DashboardLoaderData> => {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get("limit")) || 10),
  );

  try {
    const [summaryRes, earningsRes, distributionRes, recentUsersRes] =
      await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getMonthlyEarnings(),
        dashboardService.getOrderDistribution(),
        dashboardService.getRecentUsers(page, limit),
      ]);

    return {
      summary: summaryRes.data || {
        totalIncome: 0,
        totalSales: 0,
        totalUsers: 0,
        totalVendors: 0,
      },
      monthlyEarnings: earningsRes.data || [],
      orderDistribution: distributionRes.data || [],
      recentUsers: recentUsersRes.data || {
        users: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
      page,
    };
  } catch {
    return {
      summary: {
        totalIncome: 0,
        totalSales: 0,
        totalUsers: 0,
        totalVendors: 0,
      },
      monthlyEarnings: [],
      orderDistribution: [],
      recentUsers: {
        users: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
      page,
    };
  }
};

export default dashboardLoader;
