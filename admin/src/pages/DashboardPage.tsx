import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import DashboardSummaryCards from "@/components/dashboard/DashboardSummaryCards";
import MonthlyEarningsChart from "@/components/dashboard/MonthlyEarningsChart";
import OrderDistributionChart from "@/components/dashboard/OrderDistributionChart";
import RecentUsersTable from "@/components/dashboard/RecentUsersTable";
import UserDetailsDialog from "@/components/dashboard/UserDetailsDialog";
import type { DashboardLoaderData, IRecentUser } from "@/types/dashboard";
import React, { useState } from "react";
import { useLoaderData, useNavigation } from "react-router";

export const DashboardPage: React.FC = () => {
  const loaderData = useLoaderData() as DashboardLoaderData | undefined;
  const navigation = useNavigation();

  const isLoading = navigation.state === "loading";

  // Selected User state for User Details Dialog
  const [selectedUser, setSelectedUser] = useState<IRecentUser | null>(null);

  const summary = loaderData?.summary || {
    totalIncome: 0,
    totalSales: 0,
    totalUsers: 0,
    totalVendors: 0,
  };

  const monthlyEarnings = loaderData?.monthlyEarnings || [];
  const orderDistribution = loaderData?.orderDistribution || [];
  const recentUsers = loaderData?.recentUsers || {
    users: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };

  return (
    <div className="space-y-6">
      {/* Main Dashboard Layout */}
      {isLoading && !loaderData ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* 1. Summary Cards (Exactly 4 cards in responsive grid) */}
          <section aria-label="Dashboard summary metrics">
            <DashboardSummaryCards summary={summary} />
          </section>

          {/* 2. Monthly Earnings Bar Chart & Order Distribution Pie Chart */}
          <section
            aria-label="Dashboard analytics charts"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
          >
            <div className="lg:col-span-8 flex flex-col">
              <MonthlyEarningsChart data={monthlyEarnings} />
            </div>
            <div className="lg:col-span-4 flex flex-col">
              <OrderDistributionChart data={orderDistribution} />
            </div>
          </section>

          {/* 3. Recent Users and Vendors Table */}
          <section aria-label="Recent users and vendors">
            <RecentUsersTable
              data={recentUsers}
              isLoading={isLoading}
              onViewDetails={(u) => setSelectedUser(u)}
            />
          </section>
        </>
      )}

      {/* User Information Dialog */}
      <UserDetailsDialog
        open={!!selectedUser}
        userId={selectedUser?._id || null}
        initialUser={selectedUser}
        onOpenChange={(open) => {
          if (!open) setSelectedUser(null);
        }}
      />
    </div>
  );
};

export default DashboardPage;
