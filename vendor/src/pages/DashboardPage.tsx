import React, { useCallback, useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import dashboardService from "@/api/services/dashboard.service";
import ProductsAreaChartCard from "@/components/dashboard/ProductsAreaChartCard";
import RecentProductSalesTable from "@/components/dashboard/RecentProductSalesTable";
import SaleDetailsDialog from "@/components/dashboard/SaleDetailsDialog";
import SalesBarChartCard from "@/components/dashboard/SalesBarChartCard";
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
      {/* Section 1: Prominent Statistics Card - Total Products Sold */}
      <section aria-label="Total products sold metric">
        {isLoadingOverview ? (
          <div className="w-full sm:max-w-xs md:max-w-sm">
            <Card className="p-4 bg-white border border-[#E5E7EB] rounded-lg shadow-xs">
              <div className="flex items-center gap-3.5">
                <Skeleton className="w-11 h-11 rounded-md shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="w-full sm:max-w-xs md:max-w-sm">
            <SummaryCard
              title="Total Products Sold"
              value={overview?.totalSales?.toLocaleString("en-US") ?? "0"}
              icon={<ShoppingBag className="w-5 h-5 text-white" />}
              iconBackgroundColor="bg-[#4F46E5]"
            />
          </div>
        )}
      </section>

      {/* Section 2: Charts - Side by Side on Desktop */}
      <section
        aria-label="Monthly product and sales analytics"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
      >
        {/* Chart 1: Monthly Product Statistics (Area Chart) */}
        <ProductsAreaChartCard
          data={overview?.monthlyProducts || []}
          isLoading={isLoadingOverview}
        />

        {/* Chart 2: Monthly Product Sales (Bar Chart) */}
        <SalesBarChartCard
          data={overview?.monthlySales || []}
          isLoading={isLoadingOverview}
        />
      </section>

      {/* Section 3: Recent Product Sales Table */}
      <section aria-label="Recent product sales">
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
