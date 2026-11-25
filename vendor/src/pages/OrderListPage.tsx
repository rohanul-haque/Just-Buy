import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  Check,
  Eye,
  Loader2,
  MoreHorizontal,
  Package,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/api/client";
import orderService from "@/api/services/order.service";
import OrderDetailsDialog from "@/components/orders/OrderDetailsDialog";
import OrderStatisticsCards from "@/components/orders/OrderStatisticsCards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import VendorPagination from "@/components/ui/vendor-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  IOrder,
  IOrderStatistics,
  OrderStatus,
  PaymentStatus,
} from "@/types/order";

const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: "UNPAID", label: "Unpaid" },
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];

export const OrderListPage: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters, Search, Sorting and Pagination
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedOrderType, setSelectedOrderType] = useState<string>("ALL");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Debounce search input (400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Status updating & Payment confirmation state
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [updatingType, setUpdatingType] = useState<"status" | "payment" | null>(
    null,
  );

  // Selected Order for Details Dialog
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Statistics State
  const [statistics, setStatistics] = useState<IOrderStatistics | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Ref to track latest request to avoid race conditions
  const latestRequestIdRef = useRef<number>(0);

  const fetchStatistics = useCallback(async () => {
    setIsStatsLoading(true);
    setStatsError(null);
    try {
      const response = await orderService.getVendorOrderStatistics();
      if (response.success && response.data) {
        setStatistics(response.data);
      }
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setStatsError(msg);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    const requestId = ++latestRequestIdRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        page,
        limit: 10,
        sortBy,
        sortOrder,
      };
      if (selectedStatus !== "ALL") {
        params.status = selectedStatus;
      }
      if (selectedOrderType !== "ALL") {
        params.orderType = selectedOrderType;
      }
      if (selectedPaymentStatus !== "ALL") {
        params.paymentStatus = selectedPaymentStatus;
      }
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const response = await orderService.getVendorOrders(params);

      // Guard against stale response
      if (requestId !== latestRequestIdRef.current) return;

      if (response.success && response.data) {
        setOrders(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
          setTotalOrders(response.pagination.total || response.data.length);
        } else {
          setTotalPages(1);
          setTotalOrders(response.data.length);
        }
      } else {
        setOrders([]);
      }
    } catch (err) {
      if (requestId !== latestRequestIdRef.current) return;
      const msg = getApiErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [page, selectedStatus, selectedOrderType, selectedPaymentStatus, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Handle Order Status Transitions
  const handleUpdateStatus = async (
    orderId: string,
    nextStatus: OrderStatus,
  ) => {
    setUpdatingOrderId(orderId);
    setUpdatingType("status");
    try {
      const response = await orderService.updateOrderStatus(
        orderId,
        nextStatus,
      );
      if (response.success) {
        toast.success(
          response.message || `Order status updated to ${nextStatus}!`,
        );
        if (selectedOrder && selectedOrder._id === orderId && response.data) {
          setSelectedOrder(response.data);
        }
        await Promise.all([fetchOrders(), fetchStatistics()]);
      } else {
        toast.error(response.message || "Failed to update order status.");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUpdatingOrderId(null);
      setUpdatingType(null);
    }
  };

  // Handle Cash On Delivery (COD) Payment Confirmation
  const handleConfirmCODPayment = async (orderId: string) => {
    setUpdatingOrderId(orderId);
    setUpdatingType("payment");
    try {
      const response = await orderService.confirmCODPayment(orderId);
      if (response.success) {
        toast.success(
          response.message || "COD payment confirmed successfully!",
        );
        if (selectedOrder && selectedOrder._id === orderId && response.data) {
          setSelectedOrder(response.data);
        }
        await Promise.all([fetchOrders(), fetchStatistics()]);
      } else {
        toast.error(response.message || "Failed to confirm COD payment.");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUpdatingOrderId(null);
      setUpdatingType(null);
    }
  };

  // Handle Payment Status Update (COD or Online)
  const handleUpdatePaymentStatus = async (
    orderId: string,
    targetStatus: PaymentStatus,
  ) => {
    setUpdatingOrderId(orderId);
    setUpdatingType("payment");
    try {
      const response = await orderService.updatePaymentStatus(
        orderId,
        targetStatus,
      );
      if (response.success) {
        toast.success(
          response.message || `Payment status updated to ${targetStatus}!`,
        );
        if (selectedOrder && selectedOrder._id === orderId && response.data) {
          setSelectedOrder(response.data);
        }
        await Promise.all([fetchOrders(), fetchStatistics()]);
      } else {
        toast.error(response.message || "Failed to update payment status.");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUpdatingOrderId(null);
      setUpdatingType(null);
    }
  };

  // Open Details Modal
  const handleViewDetails = (order: IOrder) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  // Currency formatting matching Admin conventions (BDT ৳)
  const formatCurrency = (amount: number | undefined | null) => {
    const validAmount = Number(amount) || 0;
    return `৳${validAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]">
            Pending
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge className="bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]">
            Confirmed
          </Badge>
        );
      case "PROCESSING":
        return (
          <Badge className="bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]">
            Processing
          </Badge>
        );
      case "SHIPPED":
        return (
          <Badge className="bg-[#ECFEFF] text-[#0891B2] border-[#A5F3FC]">
            Shipped
          </Badge>
        );
      case "DELIVERED":
        return (
          <Badge className="bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]">
            Delivered
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: PaymentStatus | string | undefined) => {
    switch (status) {
      case "PAID":
        return (
          <Badge className="bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] text-[11px] px-2 py-0.5">
            Paid
          </Badge>
        );
      case "UNPAID":
        return (
          <Badge className="bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] text-[11px] px-2 py-0.5">
            Unpaid
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-[#FFFBEB] text-[#D97706] border-[#FDE68A] text-[11px] px-2 py-0.5">
            Pending
          </Badge>
        );
      case "REFUNDED":
        return (
          <Badge className="bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1] text-[11px] px-2 py-0.5">
            Refunded
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] text-[11px] px-2 py-0.5">
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[11px] px-2 py-0.5">
            {status || "Unpaid"}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Order Statistics Cards */}
      <OrderStatisticsCards
        statistics={statistics}
        isLoading={isStatsLoading}
        error={statsError}
      />

      {/* 2. Search & Filter Bar */}
      <Card className="p-4 border border-[#ffceb0]/60 bg-[#FFE7D9] rounded-xl shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search by Order ID, customer, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl border border-[#ffceb0]/80 bg-[#ffefe6] text-sm text-[#1F2937] placeholder:text-[#9CA3AF] w-full outline-none focus:outline-none focus:border-[#fe6201] focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#fe6201]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <Select
              value={selectedStatus}
              onValueChange={(val) => {
                setSelectedStatus(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-[130px] text-xs font-medium text-[#1F2937] border border-[#ffceb0]/80 bg-[#ffefe6] rounded-xl focus:ring-[#fe6201]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#FFE7D9] border border-[#ffceb0]/80">
                <SelectItem value="ALL" className="text-xs cursor-pointer hover:bg-[#ffceb0]/60">
                  All Status
                </SelectItem>
                <SelectItem value="PENDING" className="text-xs cursor-pointer hover:bg-[#ffceb0]/60">
                  Pending
                </SelectItem>
                <SelectItem value="CONFIRMED" className="text-xs cursor-pointer hover:bg-[#ffceb0]/60">
                  Confirmed
                </SelectItem>
                <SelectItem value="PROCESSING" className="text-xs cursor-pointer hover:bg-[#ffceb0]/60">
                  Processing
                </SelectItem>
                <SelectItem value="SHIPPED" className="text-xs cursor-pointer hover:bg-[#ffceb0]/60">
                  Shipped
                </SelectItem>
                <SelectItem value="DELIVERED" className="text-xs cursor-pointer hover:bg-[#ffceb0]/60">
                  Delivered
                </SelectItem>
                <SelectItem value="CANCELLED" className="text-xs cursor-pointer hover:bg-[#ffceb0]/60">
                  Cancelled
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Payment Method Filter */}
            <Select
              value={selectedOrderType}
              onValueChange={(val) => {
                setSelectedOrderType(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-[150px] text-xs font-medium text-[#1F2937] border border-[#ffceb0]/80 bg-[#ffefe6] rounded-xl focus:ring-[#fe6201]">
                <SelectValue placeholder="All Payment Types" />
              </SelectTrigger>
              <SelectContent className="bg-[#FFE7D9] border border-[#ffceb0]/80">
                <SelectItem value="ALL" className="text-xs cursor-pointer hover:bg-[#ffceb0]/60">
                  All Payment Types
                </SelectItem>
                <SelectItem value="COD" className="text-xs cursor-pointer hover:bg-[#ffceb0]/60">
                  Cash on Delivery
                </SelectItem>
                <SelectItem value="ONLINE" className="text-xs cursor-pointer hover:bg-[#ffceb0]/60">
                  Online Payment
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Payment Status Filter */}
            <Select
              value={selectedPaymentStatus}
              onValueChange={(val) => {
                setSelectedPaymentStatus(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-[140px] text-xs font-medium text-[#1F2937] border border-[#ffceb0]/80 bg-[#ffefe6] rounded-xl focus:ring-[#fe6201]">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#FFE7D9] border border-[#ffceb0]/80">
                <SelectItem value="ALL" className="text-xs cursor-pointer hover:bg-[#ffceb0]/60">
                  All Payment Status
                </SelectItem>
                <SelectItem value="UNPAID" className="text-xs cursor-pointer hover:bg-[#ffceb0]/60">
                  Unpaid
                </SelectItem>
                <SelectItem value="PENDING" className="text-xs cursor-pointer hover:bg-[#ffceb0]/60">
                  Pending
                </SelectItem>
                <SelectItem value="PAID" className="text-xs cursor-pointer hover:bg-[#ffceb0]/60">
                  Paid
                </SelectItem>
                <SelectItem value="FAILED" className="text-xs cursor-pointer hover:bg-[#ffceb0]/60">
                  Failed
                </SelectItem>
                <SelectItem value="REFUNDED" className="text-xs cursor-pointer hover:bg-[#ffceb0]/60">
                  Refunded
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Dropdown */}
            <Select
              value={`${sortBy}_${sortOrder}`}
              onValueChange={(val) => {
                const [newSortBy, newSortOrder] = val.split("_");
                setSortBy(newSortBy);
                setSortOrder(newSortOrder as "asc" | "desc");
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-[150px] text-xs font-medium text-[#1F2937] border border-[#ffceb0]/80 bg-[#ffefe6] rounded-xl focus:ring-[#fe6201]">
                <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-[#64748B]" />
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-[#FFE7D9] border border-[#ffceb0]/80">
                <SelectItem value="createdAt_desc" className="text-xs cursor-pointer hover:bg-[#ffceb0]/60">
                  Date: Newest First
                </SelectItem>
                <SelectItem value="createdAt_asc" className="text-xs cursor-pointer hover:bg-[#ffceb0]/60">
                  Date: Oldest First
                </SelectItem>
                <SelectItem value="totalAmount_desc" className="text-xs cursor-pointer hover:bg-[#ffceb0]/60">
                  Amount: High to Low
                </SelectItem>
                <SelectItem value="totalAmount_asc" className="text-xs cursor-pointer hover:bg-[#ffceb0]/60">
                  Amount: Low to High
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(selectedStatus !== "ALL" ||
              selectedOrderType !== "ALL" ||
              selectedPaymentStatus !== "ALL" ||
              sortBy !== "createdAt" ||
              sortOrder !== "desc" ||
              searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedStatus("ALL");
                  setSelectedOrderType("ALL");
                  setSelectedPaymentStatus("ALL");
                  setSortBy("createdAt");
                  setSortOrder("desc");
                  setSearchQuery("");
                  setPage(1);
                }}
                className="text-xs text-[#DC2626] hover:bg-[#ffceb0]/60 h-10 px-2.5 cursor-pointer rounded-xl"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 3. Main Orders Table */}
      <Card className="border border-[#ffceb0]/60 bg-[#FFE7D9] rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center pt-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#fe6201] mr-2" />
              <p className="text-xs text-[#64748B]">
                Loading orders from server...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3 text-center">
            <AlertCircle className="w-10 h-10 text-[#DC2626]" />
            <p className="text-sm font-semibold text-[#1F2937]">
              Unable to load orders
            </p>
            <p className="text-xs text-[#64748B] max-w-md">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchOrders()}
              className="mt-2 text-xs border-[#ffceb0]/80 bg-[#ffefe6] text-[#1F2937] hover:bg-[#ffceb0]"
            >
              Retry
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-3 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#ffceb0]/40 border border-[#ffceb0] text-[#fe6201] flex items-center justify-center mx-auto mb-1">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-base font-semibold text-[#1F2937]">
              No orders found
            </p>
            <p className="text-xs text-[#64748B] max-w-sm">
              {searchQuery ||
              selectedStatus !== "ALL" ||
              selectedOrderType !== "ALL" ||
              selectedPaymentStatus !== "ALL"
                ? "No orders match your selected search or filters. Try adjusting your query."
                : "You haven't received any customer orders yet. Newly placed orders for your products will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#CB4E01] text-white">
                <TableRow className="border-b border-[#CB4E01] hover:bg-[#CB4E01]">
                  {/* 1. Product Name */}
                  <TableHead className="font-semibold text-xs text-white uppercase py-3 pl-6">
                    Product Name
                  </TableHead>
                  {/* 2. Order ID */}
                  <TableHead className="font-semibold text-xs text-white uppercase py-3">
                    Order ID
                  </TableHead>
                  {/* 3. Date */}
                  <TableHead className="font-semibold text-xs text-white uppercase py-3">
                    Date
                  </TableHead>
                  {/* 4. Customer Name */}
                  <TableHead className="font-semibold text-xs text-white uppercase py-3">
                    Customer Name
                  </TableHead>
                  {/* 5. Order Status */}
                  <TableHead className="font-semibold text-xs text-white uppercase py-3 text-center">
                    Order Status
                  </TableHead>
                  {/* 6. Amount */}
                  <TableHead className="font-semibold text-xs text-white uppercase py-3 text-right">
                    Amount
                  </TableHead>
                  {/* 7. Payment Method */}
                  <TableHead className="font-semibold text-xs text-white uppercase py-3">
                    Payment Method
                  </TableHead>
                  {/* 8. Transaction ID */}
                  <TableHead className="font-semibold text-xs text-white uppercase py-3">
                    Transaction ID
                  </TableHead>
                  {/* 9. Actions */}
                  <TableHead className="font-semibold text-xs text-white uppercase py-3 text-center pr-6">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-[#ffceb0]/40 bg-[#FFE7D9]">
                {orders.map((order) => {
                  const items = order.productItems || [];
                  const primaryItem = items[0];
                  const extraItemsCount = items.length - 1;

                  // Vendor relevant item amount excluding delivery charge
                  const vendorAmount =
                    items.length > 0
                      ? items.reduce(
                          (sum, it) =>
                            sum +
                            (Number(it.itemSubtotal) ||
                              Number(it.unitPrice * it.quantity) ||
                              0),
                          0,
                        )
                      : Number(order.subtotal || 0);

                  const isCOD =
                    order.orderType === "COD" ||
                    order.payment?.paymentMethod === "COD";
                  const currentPaymentStatus = order.payment?.status;

                  // Shortened Transaction ID
                  const rawTxId =
                    order.transactionNumber ||
                    (order.payment as any)?.stripePaymentIntentId ||
                    (order.payment as any)?._id ||
                    "";
                  const shortTxId = rawTxId
                    ? rawTxId.length > 8
                      ? `${rawTxId.slice(0, 8)}...`
                      : rawTxId
                    : "—";

                  const isRowUpdatingStatus =
                    updatingOrderId === order._id && updatingType === "status";
                  const isRowUpdatingPayment =
                    updatingOrderId === order._id && updatingType === "payment";
                  const isRowBusy = updatingOrderId === order._id;

                  return (
                    <TableRow
                      key={order._id}
                      className="hover:bg-[#ffceb0]/40 transition-colors border-b border-[#ffceb0]/40"
                    >
                      {/* 1. Product Name */}
                      <TableCell className="pl-6 py-3.5">
                        <div className="min-w-0">
                          <p
                            className="text-sm font-semibold text-[#1F2937] truncate max-w-[200px]"
                            title={primaryItem?.name || "Ordered Product"}
                          >
                            {primaryItem?.name || "Ordered Product"}
                          </p>
                          {extraItemsCount > 0 && (
                            <span className="text-xs text-[#fe6201] font-semibold block mt-0.5">
                              +{extraItemsCount} more item
                              {extraItemsCount > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* 2. Order ID */}
                      <TableCell className="text-xs font-mono font-semibold text-[#1F2937] py-3.5 whitespace-nowrap">
                        #
                        {order.transactionNumber ||
                          order._id.slice(-6).toUpperCase()}
                      </TableCell>

                      {/* 3. Date */}
                      <TableCell className="text-xs text-[#4B5563] py-3.5 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>

                      {/* 4. Customer Name */}
                      <TableCell className="text-xs font-medium text-[#1F2937] py-3.5">
                        {order.buyer?.name ||
                          order.shippingAddress?.fullName ||
                          "Customer"}
                      </TableCell>

                      {/* 5. Order Status with Three-Dot Menu */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center justify-center gap-1">
                          {getOrderStatusBadge(order.status)}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={isRowBusy}
                                className="h-7 w-7 p-0 rounded-md hover:bg-[#ffceb0]/60 text-[#64748B] cursor-pointer"
                                title="Update order status"
                              >
                                {isRowUpdatingStatus ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48 bg-[#FFE7D9] border border-[#ffceb0]/80"
                            >
                              <DropdownMenuLabel className="text-xs text-[#64748B]">
                                Change Order Status
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-[#ffceb0]/60" />
                              {ORDER_STATUS_OPTIONS.map((opt) => {
                                const isActive = order.status === opt.value;
                                return (
                                  <DropdownMenuItem
                                    key={opt.value}
                                    onClick={() =>
                                      handleUpdateStatus(order._id, opt.value)
                                    }
                                    className={`text-xs cursor-pointer font-medium hover:bg-[#ffceb0]/60 flex items-center justify-between ${
                                      isActive
                                        ? "text-[#fe6201] font-bold"
                                        : ""
                                    }`}
                                  >
                                    <span>Mark as {opt.label}</span>
                                    {isActive && (
                                      <Check className="w-3.5 h-3.5 text-[#fe6201]" />
                                    )}
                                  </DropdownMenuItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>

                      {/* 6. Amount */}
                      <TableCell className="text-sm font-bold text-[#1F2937] text-right py-3.5 whitespace-nowrap">
                        {formatCurrency(vendorAmount)}
                      </TableCell>

                      {/* 7. Payment Method with Three-Dot Menu */}
                      <TableCell className="text-xs text-[#4B5563] py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div className="flex flex-col">
                            <span className="font-medium text-[#1F2937]">
                              {isCOD ? "Cash on Delivery" : "Online Payment"}
                            </span>
                            <div className="mt-1">
                              {getPaymentStatusBadge(currentPaymentStatus)}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={isRowBusy}
                                className="h-6 w-6 p-0 rounded-md hover:bg-[#ffceb0]/60 text-[#64748B] cursor-pointer"
                                title="Change payment status"
                              >
                                {isRowUpdatingPayment ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-52 bg-[#FFE7D9] border border-[#ffceb0]/80"
                            >
                              <DropdownMenuLabel className="text-xs text-[#64748B]">
                                Change Payment Status
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-[#ffceb0]/60" />
                              {PAYMENT_STATUS_OPTIONS.map((opt) => {
                                const isActive =
                                  currentPaymentStatus === opt.value;
                                return (
                                  <DropdownMenuItem
                                    key={opt.value}
                                    onClick={() =>
                                      handleUpdatePaymentStatus(
                                        order._id,
                                        opt.value,
                                      )
                                    }
                                    className={`text-xs cursor-pointer font-medium hover:bg-[#ffceb0]/60 flex items-center justify-between ${
                                      isActive
                                        ? "text-[#fe6201] font-bold"
                                        : ""
                                    }`}
                                  >
                                    <span>Mark as {opt.label}</span>
                                    {isActive && (
                                      <Check className="w-3.5 h-3.5 text-[#fe6201]" />
                                    )}
                                  </DropdownMenuItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>

                      {/* 8. Transaction ID (shortened with tooltip) */}
                      <TableCell className="text-xs font-mono text-[#1F2937] py-3.5 whitespace-nowrap">
                        {rawTxId ? (
                          <span
                            title={rawTxId}
                            className="cursor-help hover:text-[#fe6201] font-medium"
                          >
                            {shortTxId}
                          </span>
                        ) : (
                          <span className="text-[#9CA3AF]">—</span>
                        )}
                      </TableCell>

                      {/* 9. Actions */}
                      <TableCell className="text-center pr-6 py-3.5">
                        <div className="flex items-center justify-center">
                          {/* View Details */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(order)}
                            className="w-8 h-8 rounded-md text-[#4B5563] hover:text-[#CB4E01] hover:bg-[#ffceb0]/60 cursor-pointer"
                            title="View Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* 4. Server-Side Pagination using shadcn/ui Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#ffceb0]/60 bg-[#FFE7D9]">
            <VendorPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              isLoading={isLoading}
            />
          </div>
        )}
      </Card>

      {/* 5. Order Details Modal */}
      <OrderDetailsDialog
        order={selectedOrder}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onConfirmCODPayment={handleConfirmCODPayment}
        isConfirmingCOD={
          updatingOrderId === selectedOrder?._id && updatingType === "payment"
        }
      />
    </div>
  );
};

export default OrderListPage;
