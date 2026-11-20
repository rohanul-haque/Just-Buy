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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <Card className="rounded-md p-6 border-[#E5E7EB] bg-white flex flex-col justify-between shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
          {title}
        </span>
        <div className="w-10 h-10 rounded-md bg-[#E0E7FF] flex items-center justify-center text-[#4F46E5]">
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
    </Card>
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
          <Badge className="bg-[#E0E7FF] text-[#4F46E5] hover:bg-[#E0E7FF] rounded-md font-semibold border-none">
            Delivered
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-md font-semibold border-none">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-[#F8FAFC] text-[#4B5563] border-[#E5E7EB] rounded-md font-semibold">
            {status || "Pending"}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <Card className="rounded-md p-6 border-[#E5E7EB] bg-white">
        <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
              Welcome back, {displayName}
            </h2>
            <p className="text-sm text-[#4B5563] mt-1 font-normal">
              Platform performance overview and recent activity.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={loadData}
              disabled={isLoading}
              className="h-10 px-5 rounded-md border-[#E5E7EB] text-[#0F172A] hover:bg-[#F8FAFC]"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] flex items-center justify-between text-sm">
          <span>{error}</span>
          <Button
            variant="link"
            onClick={loadData}
            className="text-xs font-semibold text-[#EF4444] p-0 h-auto underline"
          >
            Retry
          </Button>
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

      {/* Recent Orders Section (Standardized with shadcn Table) */}
      <Card className="rounded-md p-6 border-[#E5E7EB] bg-white space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#0F172A]">
              Recent Platform Orders
            </h3>
            <p className="text-xs text-[#4B5563]">
              Latest transactions recorded across all vendor stores
            </p>
          </div>
          <Button asChild variant="link" className="p-0 h-auto text-xs font-semibold text-[#4F46E5] hover:text-[#6366F1]">
            <Link to="/earnings" className="inline-flex items-center gap-1.5">
              <span>View All Transactions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : metrics.recentOrders.length === 0 ? (
          <div className="py-12 text-center text-[#4B5563]">
            <Clock className="w-8 h-8 mx-auto text-[#4B5563]/40 mb-2" />
            <p className="text-sm">No orders recorded yet.</p>
          </div>
        ) : (
          <div className="rounded-md border border-[#E5E7EB] overflow-hidden">
            <Table>
              <TableHeader className="bg-[#F8FAFC]">
                <TableRow className="border-b border-[#E5E7EB]">
                  <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">Order ID</TableHead>
                  <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">Amount</TableHead>
                  <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">Admin Commission</TableHead>
                  <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.recentOrders.map((order) => {
                  const commission =
                    (order.productItems || order.items || []).reduce(
                      (acc, item) => acc + (Number(item.adminCommission) || 0),
                      0,
                    );
                  return (
                    <TableRow
                      key={order._id}
                      className="hover:bg-[#F8FAFC] transition-colors border-b border-[#E5E7EB]"
                    >
                      <TableCell className="font-mono text-xs font-medium text-[#111827]">
                        #{order._id.slice(-6).toUpperCase()}
                      </TableCell>
                      <TableCell className="font-semibold text-[#0F172A]">
                        ${Number(order.totalAmount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="font-medium text-[#4F46E5]">
                        +${commission.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="text-xs text-[#4B5563]">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;
