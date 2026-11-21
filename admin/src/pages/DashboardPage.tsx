import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import DashboardSummaryCards from "@/components/dashboard/DashboardSummaryCards";
import MonthlyEarningsChart from "@/components/dashboard/MonthlyEarningsChart";
import OrderDistributionChart from "@/components/dashboard/OrderDistributionChart";
import RecentUsersTable from "@/components/dashboard/RecentUsersTable";
import UserDetailsDialog from "@/components/dashboard/UserDetailsDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import type { DashboardLoaderData, IRecentUser } from "@/types/dashboard";
import { RefreshCw } from "lucide-react";
import React, { useState } from "react";
import { useLoaderData, useNavigation, useNavigate } from "react-router";

export const DashboardPage: React.FC = () => {
  const { user, adminProfile } = useAuth();
  const loaderData = useLoaderData() as DashboardLoaderData | undefined;
  const navigation = useNavigation();
  const navigate = useNavigate();

  const displayName =
    adminProfile?.admin?.name ||
    (adminProfile as any)?.name ||
    user?.name ||
    "Admin";

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

  const handleRefresh = () => {
    navigate(".", { replace: true });
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <Card className="rounded-md p-6 border-[#E5E7EB] bg-white shadow-xs">
        <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
              Welcome back, {displayName}
            </h2>
            <p className="text-sm text-[#4B5563] mt-1 font-normal">
              Platform income, sales volume, and registered user overview.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-10 px-5 rounded-md border-[#E5E7EB] text-[#0F172A] hover:bg-[#F8FAFC]"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </Button>
          </div>
        </CardContent>
      </Card>

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
            <div className="lg:col-span-7 flex flex-col">
              <MonthlyEarningsChart data={monthlyEarnings} />
            </div>
            <div className="lg:col-span-5 flex flex-col">
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
