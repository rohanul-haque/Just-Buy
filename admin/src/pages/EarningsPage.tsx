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
          <button
            type="button"
            onClick={fetchOrders}
            disabled={isLoading}
            className="p-2.5 rounded-full bg-white border border-[#E5E7EB] text-[#1F2937] hover:text-[#4F46E5] hover:bg-[#F8FAFC] transition cursor-pointer disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="h-10 flex items-center gap-2 px-5 rounded-full bg-white border border-[#E5E7EB] text-[#0F172A] hover:bg-[#F8FAFC] text-sm font-medium transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-[16px] p-6 md:p-[28px] border border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
              Total Admin Commission
            </span>
            <div className="w-10 h-10 rounded-full bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-[28px] font-extrabold text-[#4F46E5] leading-8">
            ${totalPlatformEarnings.toFixed(2)}
          </h3>
          <p className="text-xs text-[#4B5563] mt-2">Net platform earnings</p>
        </div>

        <div className="bg-white rounded-[16px] p-6 md:p-[28px] border border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
              Gross Platform Sales
            </span>
            <div className="w-10 h-10 rounded-full bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-[28px] font-extrabold text-[#4F46E5] leading-8">
            ${totalGrossSales.toFixed(2)}
          </h3>
          <p className="text-xs text-[#4B5563] mt-2">Total order volume</p>
        </div>

        <div className="bg-white rounded-[16px] p-6 md:p-[28px] border border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
              Total Vendor Payouts
            </span>
            <div className="w-10 h-10 rounded-full bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-[28px] font-extrabold text-[#4F46E5] leading-8">
            ${totalVendorPayouts.toFixed(2)}
          </h3>
          <p className="text-xs text-[#4B5563] mt-2">Disbursed to vendors</p>
        </div>

        <div className="bg-white rounded-[16px] p-6 md:p-[28px] border border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
              Avg. Commission / Order
            </span>
            <div className="w-10 h-10 rounded-full bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-[28px] font-extrabold text-[#4F46E5] leading-8">
            ${avgCommission.toFixed(2)}
          </h3>
          <p className="text-xs text-[#4B5563] mt-2">Average yield per order</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-[16px] border border-[#E5E7EB]">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#4B5563] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID..."
            className="w-full pl-11 pr-4 py-2 rounded-full bg-white border border-[#E5E7EB] text-sm text-[#0F172A] placeholder:text-[#4B5563] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5]"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "DELIVERED", "PROCESSING", "CANCELLED"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`h-9 px-4 rounded-full text-xs font-medium transition cursor-pointer ${
                statusFilter === status
                  ? "bg-[#6366F1] text-white"
                  : "bg-white text-[#1F2937] hover:bg-[#F8FAFC] border border-[#E5E7EB]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-[16px] border border-[#E5E7EB] overflow-hidden">
        {error ? (
          <div className="p-6 text-center text-[#EF4444] text-sm">{error}</div>
        ) : isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-[#F8FAFC] rounded-[8px] animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-[#4B5563] text-sm">
            No transactions match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-xs font-semibold text-[#4B5563] uppercase tracking-wider bg-[#F8FAFC]">
                  <th className="py-3.5 px-4">Transaction / Order #</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Gross Total</th>
                  <th className="py-3.5 px-4">Admin Commission</th>
                  <th className="py-3.5 px-4">Vendor Payout</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
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
                    <tr
                      key={order._id}
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-[#0F172A]">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#4B5563]">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#0F172A]">
                        ${Number(order.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#4F46E5]">
                        +${adminComm.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-[#111827] font-medium">
                        ${vendorEarn.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === "DELIVERED"
                              ? "bg-[#E0E7FF] text-[#4F46E5]"
                              : order.status === "CANCELLED"
                              ? "bg-[#EF4444]/10 text-[#EF4444]"
                              : "bg-[#F8FAFC] text-[#4B5563] border border-[#E5E7EB]"
                          }`}
                        >
                          {order.status || "PENDING"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EarningsPage;
