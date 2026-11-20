import React, { useEffect, useState, useCallback } from "react";
import {
  Wallet,
  TrendingUp,
  DollarSign,
  Search,
  RefreshCw,
  Download,
  Receipt,
} from "lucide-react";
import orderService from "@/api/services/order.service";
import type { IOrder } from "@/types/order";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export const EarningsPage: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await orderService.getAllOrders({ limit: 100 });
      setOrders(res.data || []);
    } catch {
      setError("Failed to load platform earnings data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Aggregate totals
  const totalPlatformEarnings = orders.reduce((sum, order) => {
    const items = order.productItems || order.items || [];
    return (
      sum +
      items.reduce(
        (sub, it) => sub + (Number(it.adminCommission) || 0),
        0,
      )
    );
  }, 0);

  const totalGrossSales = orders.reduce(
    (sum, order) => sum + (Number(order.totalAmount) || 0),
    0,
  );

  const totalVendorPayouts = orders.reduce((sum, order) => {
    const items = order.productItems || order.items || [];
    return (
      sum +
      items.reduce(
        (sub, it) => sub + (Number(it.vendorEarning) || 0),
        0,
      )
    );
  }, 0);

  const avgCommission =
    orders.length > 0 ? totalPlatformEarnings / orders.length : 0;

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.transactionNumber?.toLowerCase() || "").includes(
        searchQuery.toLowerCase(),
      );
    const matchesStatus =
      statusFilter === "ALL" ||
      order.status?.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    if (orders.length === 0) {
      toast.error("No transactions to export");
      return;
    }
    const headers = [
      "Order ID",
      "Date",
      "Total Amount",
      "Admin Commission",
      "Vendor Earning",
      "Status",
    ];
    const rows = orders.map((o) => {
      const items = o.productItems || o.items || [];
      const adminComm = items.reduce(
        (a, i) => a + (Number(i.adminCommission) || 0),
        0,
      );
      const vendorEarn = items.reduce(
        (a, i) => a + (Number(i.vendorEarning) || 0),
        0,
      );
      return [
        o._id,
        o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "",
        o.totalAmount,
        adminComm,
        vendorEarn,
        o.status,
      ].join(",");
    });
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `earnings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Earnings report exported successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
            Platform Earnings
          </h2>
          <p className="text-sm text-[#4B5563] mt-1 font-normal">
            Track marketplace commission, vendor payouts, and gross platform volume.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchOrders}
            disabled={isLoading}
            className="rounded-md border-[#E5E7EB] text-[#1F2937] hover:text-[#4F46E5] hover:bg-[#F8FAFC]"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="h-10 px-5 rounded-md border-[#E5E7EB] text-[#0F172A] hover:bg-[#F8FAFC] text-sm font-medium"
          >
            <Download className="w-4 h-4 mr-2" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="rounded-md p-6 border-[#E5E7EB] bg-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
              Total Admin Commission
            </span>
            <div className="w-10 h-10 rounded-md bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-[28px] font-extrabold text-[#4F46E5] leading-8">
            ${totalPlatformEarnings.toFixed(2)}
          </h3>
          <p className="text-xs text-[#4B5563] mt-2">Net platform earnings</p>
        </Card>

        <Card className="rounded-md p-6 border-[#E5E7EB] bg-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
              Gross Platform Sales
            </span>
            <div className="w-10 h-10 rounded-md bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-[28px] font-extrabold text-[#4F46E5] leading-8">
            ${totalGrossSales.toFixed(2)}
          </h3>
          <p className="text-xs text-[#4B5563] mt-2">Total order volume</p>
        </Card>

        <Card className="rounded-md p-6 border-[#E5E7EB] bg-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
              Total Vendor Payouts
            </span>
            <div className="w-10 h-10 rounded-md bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-[28px] font-extrabold text-[#4F46E5] leading-8">
            ${totalVendorPayouts.toFixed(2)}
          </h3>
          <p className="text-xs text-[#4B5563] mt-2">Disbursed to vendors</p>
        </Card>

        <Card className="rounded-md p-6 border-[#E5E7EB] bg-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
              Avg. Commission / Order
            </span>
            <div className="w-10 h-10 rounded-md bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-[28px] font-extrabold text-[#4F46E5] leading-8">
            ${avgCommission.toFixed(2)}
          </h3>
          <p className="text-xs text-[#4B5563] mt-2">Average yield per order</p>
        </Card>
      </div>

      {/* Filter and Search Bar (shadcn Input & Button) */}
      <Card className="rounded-md p-3 border-[#E5E7EB] bg-white">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#4B5563] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID..."
              className="pl-9 h-9 rounded-md bg-white border-[#E5E7EB] text-sm text-[#0F172A]"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {["ALL", "DELIVERED", "PROCESSING", "CANCELLED"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={`h-8 px-3 rounded-md text-xs font-medium ${
                  statusFilter === status
                    ? "bg-[#6366F1] hover:bg-[#4F46E5] text-white"
                    : "bg-white text-[#1F2937] hover:bg-[#F8FAFC] border-[#E5E7EB]"
                }`}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Transactions Table (shadcn Table) */}
      <Card className="rounded-md border-[#E5E7EB] bg-white overflow-hidden shadow-xs">
        {error ? (
          <div className="p-6 text-center text-[#EF4444] text-sm">{error}</div>
        ) : isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-[#4B5563] text-sm">
            No transactions match the selected criteria.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#F8FAFC]">
              <TableRow className="border-b border-[#E5E7EB]">
                <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">Transaction / Order #</TableHead>
                <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">Date</TableHead>
                <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">Gross Total</TableHead>
                <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">Admin Commission</TableHead>
                <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">Vendor Payout</TableHead>
                <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const items = order.productItems || order.items || [];
                const adminComm = items.reduce(
                  (a, i) => a + (Number(i.adminCommission) || 0),
                  0,
                );
                const vendorEarn = items.reduce(
                  (a, i) => a + (Number(i.vendorEarning) || 0),
                  0,
                );

                return (
                  <TableRow
                    key={order._id}
                    className="hover:bg-[#F8FAFC] transition-colors border-b border-[#E5E7EB]"
                  >
                    <TableCell className="font-mono text-xs font-semibold text-[#0F172A]">
                      #{order._id.slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell className="text-xs text-[#4B5563]">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell className="font-semibold text-[#0F172A]">
                      ${Number(order.totalAmount || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="font-semibold text-[#4F46E5]">
                      +${adminComm.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-[#111827] font-medium">
                      ${vendorEarn.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`rounded-md text-xs font-semibold ${
                          order.status === "DELIVERED"
                            ? "bg-[#E0E7FF] text-[#4F46E5] hover:bg-[#E0E7FF]"
                            : order.status === "CANCELLED"
                            ? "bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/10"
                            : "bg-[#F8FAFC] text-[#4B5563] border border-[#E5E7EB]"
                        }`}
                      >
                        {order.status || "PENDING"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default EarningsPage;
