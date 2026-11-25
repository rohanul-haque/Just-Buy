import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import DashboardSummaryCards from "@/components/dashboard/DashboardSummaryCards";
import MonthlyEarningsChart from "@/components/dashboard/MonthlyEarningsChart";
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
          {/* 1. Summary Cards (Exactly 4 cards in responsive grid: Total Income, Total Sales, Total Users, Total Vendors) */}
          <section aria-label="Dashboard summary metrics">
            <DashboardSummaryCards summary={summary} />
          </section>

          {/* 2. Monthly Overview Bar Chart (Full width, single Earning metric) */}
          <section aria-label="Monthly earnings overview">
            <div className="w-full">
              <MonthlyEarningsChart
                data={monthlyEarnings}
                title="Monthly Overview"
                subtitle="Monthly earnings overview"
                legendLabel="Earning ($)"
              />
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
