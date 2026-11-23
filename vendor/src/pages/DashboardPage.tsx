import React, { useCallback, useEffect, useState } from "react";
import { Package, Wallet } from "lucide-react";
import { toast } from "sonner";
import dashboardService from "@/api/services/dashboard.service";
import EarningsBarChart from "@/components/dashboard/EarningsBarChart";
import ProductSellingAreaChart from "@/components/dashboard/ProductSellingAreaChart";
import RecentProductSalesTable from "@/components/dashboard/RecentProductSalesTable";
import SaleDetailsDialog from "@/components/dashboard/SaleDetailsDialog";
import SummaryCard from "@/components/ui/SummaryCard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  IVendorDashboardOverview,
  IVendorRecentSale,
} from "@/types/dashboard";

export const DashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<IVendorDashboardOverview | null>(
    null,
  );
  const [sales, setSales] = useState<IVendorRecentSale[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null>(null);

  const [isLoadingOverview, setIsLoadingOverview] = useState<boolean>(true);
  const [isLoadingSales, setIsLoadingSales] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);

  // Selected sale for details modal
  const [selectedSale, setSelectedSale] = useState<IVendorRecentSale | null>(
    null,
  );

  // Fetch overview metrics & chart data once on mount
  const fetchOverview = useCallback(async () => {
    try {
      setIsLoadingOverview(true);
      const res = await dashboardService.getVendorOverview();
      setOverview(res.data);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to load dashboard overview",
      );
    } finally {
      setIsLoadingOverview(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // Fetch recent sales whenever page changes
  const fetchSales = useCallback(async () => {
    try {
      setIsLoadingSales(true);
      const res = await dashboardService.getVendorRecentSales({
        page,
        limit: 10,
      });
      setSales(res.data || []);
      setPagination(
        (res as any).pagination || {
          page: 1,
          limit: 10,
          total: res.data?.length || 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      );
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to load recent product sales",
      );
    } finally {
      setIsLoadingSales(false);
    }
  }, [page]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return (
    <div className="space-y-6">
      {/* Section 1: Dashboard Statistics Cards - Exactly Two Cards Side by Side */}
      <section
        aria-label="Dashboard statistics"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6"
      >
        {isLoadingOverview ? (
          <>
            <Card className="p-4 bg-white border border-[#E5E7EB] rounded-lg shadow-xs">
              <div className="flex items-center gap-3.5">
                <Skeleton className="w-11 h-11 rounded-md shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white border border-[#E5E7EB] rounded-lg shadow-xs">
              <div className="flex items-center gap-3.5">
                <Skeleton className="w-11 h-11 rounded-md shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </Card>
          </>
        ) : (
          <>
            {/* Card 1: Total Products */}
            <SummaryCard
              title="Total Products"
              value={(overview?.totalProducts ?? 0).toLocaleString("en-US")}
              icon={<Package className="w-5 h-5 text-white" />}
              iconBackgroundColor="bg-[#4F46E5]"
            />

            {/* Card 2: Total Earnings */}
            <SummaryCard
              title="Total Earnings"
              value={`$${(overview?.totalEarnings ?? 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              icon={<Wallet className="w-5 h-5 text-white" />}
              iconBackgroundColor="bg-[#10B981]"
            />
          </>
        )}
      </section>

      {/* Section 2: Charts - Side by Side on Desktop using shadcn/ui Chart Components */}
      <section
        aria-label="Monthly product and earnings analytics"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
      >
        {/* Chart 1: Product Selling Overview (shadcn/ui Area Chart) */}
        <ProductSellingAreaChart
          data={overview?.monthlyProductSales || []}
          isLoading={isLoadingOverview}
        />

        {/* Chart 2: Earnings Overview (shadcn/ui Bar Chart) */}
        <EarningsBarChart
          data={overview?.monthlyEarnings || []}
          isLoading={isLoadingOverview}
        />
      </section>

      {/* Section 3: Recent Selling Products Table */}
      <section aria-label="Recent selling products">
        <RecentProductSalesTable
          sales={sales}
          pagination={pagination}
          currentPage={page}
          isLoading={isLoadingSales}
          onPageChange={setPage}
          onViewDetails={(sale) => setSelectedSale(sale)}
        />
      </section>

      {/* Sale Details Dialog */}
      <SaleDetailsDialog
        sale={selectedSale}
        open={!!selectedSale}
        onOpenChange={(open) => {
          if (!open) setSelectedSale(null);
        }}
      />
    </div>
  );
};

export default DashboardPage;
