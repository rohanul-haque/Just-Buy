import React, { useEffect, useState, useCallback } from "react";
import {
  Wallet,
  ShoppingBag,
  Users,
  Store,
  Layers,
  ArrowRight,
  RefreshCw,
  Clock,
} from "lucide-react";
import { Link } from "react-router";
import orderService from "@/api/services/order.service";
import { useAuth } from "@/hooks/useAuth";
import type { IOrder } from "@/types/order";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  link?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  link,
}) => {
  const content = (
    <div className="bg-white rounded-[16px] p-6 md:p-[28px] border border-[#E5E7EB] flex flex-col justify-between transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
          {title}
        </span>
        <div className="w-10 h-10 rounded-full bg-[#E0E7FF] flex items-center justify-center text-[#4F46E5]">
          {icon}
        </div>
      </div>
      <div>
        <h4 className="text-[28px] font-extrabold text-[#4F46E5] leading-8">
          {value}
        </h4>
        {subtitle && (
          <p className="text-xs text-[#4B5563] mt-2 font-normal">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }
  return content;
};

export const DashboardPage: React.FC = () => {
  const { user, adminProfile } = useAuth();
  const displayName =
    adminProfile?.admin?.name ||
    (adminProfile as any)?.name ||
    user?.name ||
    "Admin";

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    totalEarnings: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalVendors: 0,
    totalProducts: 0,
    recentOrders: [] as IOrder[],
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await orderService.getDashboardMetrics();
      setMetrics(data);
    } catch {
      setError("Failed to load dashboard metrics. Please check network connection.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getStatusBadge = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
      case "DELIVERED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#E0E7FF] text-[#4F46E5]">
            Delivered
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#EF4444]/10 text-[#EF4444]">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#F8FAFC] text-[#4B5563] border border-[#E5E7EB]">
            {status || "Pending"}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-[16px] p-6 md:p-[28px] border border-[#E5E7EB]">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
            Welcome back, {displayName}
          </h2>
          <p className="text-sm text-[#4B5563] mt-1 font-normal">
            Platform performance overview and recent activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="h-10 flex items-center gap-2 px-5 rounded-full bg-white border border-[#E5E7EB] text-[#0F172A] hover:bg-[#F8FAFC] text-sm font-medium transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-[16px] bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] flex items-center justify-between text-sm">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadData}
            className="font-medium underline hover:no-underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <MetricCard
          title="Platform Earnings"
          value={`$${metrics.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Admin Commission"
          icon={<Wallet className="w-5 h-5" />}
          link="/earnings"
        />
        <MetricCard
          title="Total Orders"
          value={metrics.totalOrders}
          subtitle="All-time processed"
          icon={<ShoppingBag className="w-5 h-5" />}
          link="/earnings"
        />
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers}
          subtitle="Registered accounts"
          icon={<Users className="w-5 h-5" />}
          link="/users"
        />
        <MetricCard
          title="Total Vendors"
          value={metrics.totalVendors}
          subtitle="Registered shops"
          icon={<Store className="w-5 h-5" />}
          link="/vendors"
        />
        <MetricCard
          title="Total Products"
          value={metrics.totalProducts}
          subtitle="Platform catalog"
          icon={<Layers className="w-5 h-5" />}
          link="/categories"
        />
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-[16px] p-6 md:p-[28px] border border-[#E5E7EB] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#0F172A]">
              Recent Platform Orders
            </h3>
            <p className="text-xs text-[#4B5563]">
              Latest transactions recorded across all vendor stores
            </p>
          </div>
          <Link
            to="/earnings"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5] hover:text-[#6366F1] transition"
          >
            <span>View All Transactions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-[#F8FAFC] rounded-[8px] animate-pulse" />
            ))}
          </div>
        ) : metrics.recentOrders.length === 0 ? (
          <div className="py-12 text-center text-[#4B5563]">
            <Clock className="w-8 h-8 mx-auto text-[#4B5563]/40 mb-2" />
            <p className="text-sm">No orders recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Admin Commission</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {metrics.recentOrders.map((order) => {
                  const commission =
                    (order.productItems || order.items || []).reduce(
                      (acc, item) => acc + (Number(item.adminCommission) || 0),
                      0,
                    );
                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-xs font-medium text-[#111827]">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#0F172A]">
                        ${Number(order.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#4F46E5]">
                        +${commission.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#4B5563]">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "N/A"}
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

export default DashboardPage;
