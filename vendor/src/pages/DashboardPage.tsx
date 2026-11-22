import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import dashboardService from "@/api/services/dashboard.service";
import ProductsAreaChartCard from "@/components/dashboard/ProductsAreaChartCard";
import RecentProductSalesTable from "@/components/dashboard/RecentProductSalesTable";
import SaleDetailsDialog from "@/components/dashboard/SaleDetailsDialog";
import SalesBarChartCard from "@/components/dashboard/SalesBarChartCard";
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
      {/* 1. Main Analytics Cards Section (Side by Side on Desktop) */}
      <section
        aria-label="Vendor product and sales analytics"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
      >
        {/* Card 1: Total Products + Area Chart */}
        <ProductsAreaChartCard
          totalProducts={overview?.totalProducts || 0}
          data={overview?.monthlyProducts || []}
          isLoading={isLoadingOverview}
        />

        {/* Card 2: Total Sales + Bar Chart */}
        <SalesBarChartCard
          totalSales={overview?.totalSales || 0}
          data={overview?.monthlySales || []}
          isLoading={isLoadingOverview}
        />
      </section>

      {/* 2. Recent Product Sales Table */}
      <section aria-label="Recent product sales table">
        <RecentProductSalesTable
          sales={sales}
          pagination={pagination}
          currentPage={page}
          isLoading={isLoadingSales}
          onPageChange={setPage}
          onViewDetails={(sale) => setSelectedSale(sale)}
        />
      </section>

      {/* 3. Sale Details Dialog */}
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
