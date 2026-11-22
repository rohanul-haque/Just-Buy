import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  Loader2,
  MoreVertical,
  Package,
  RotateCcw,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/api/client";
import orderService from "@/api/services/order.service";
import OrderDetailsDialog from "@/components/orders/OrderDetailsDialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  VALID_ORDER_STATUS_TRANSITIONS,
  type IOrder,
  type OrderStatus,
  type PaymentStatus,
} from "@/types/order";

export const OrderListPage: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and Pagination
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedOrderType, setSelectedOrderType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Status updating & Payment confirmation state
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [updatingType, setUpdatingType] = useState<"status" | "payment" | null>(
    null,
  );

  // Selected Order for Details Dialog
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        page,
        limit: 10,
      };
      if (selectedStatus !== "ALL") {
        params.status = selectedStatus;
      }
      if (selectedOrderType !== "ALL") {
        params.orderType = selectedOrderType;
      }

      const response = await orderService.getVendorOrders(params);
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
      const msg = getApiErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedStatus, selectedOrderType]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
        await fetchOrders();
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
        await fetchOrders();
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

  // Filter orders by search query locally
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const orderNumber = (order.transactionNumber || order._id).toLowerCase();
    const customerName = (
      order.buyer?.name ||
      order.shippingAddress?.fullName ||
      ""
    ).toLowerCase();
    const productNames = (order.productItems || [])
      .map((i) => i.name.toLowerCase())
      .join(" ");
    return (
      orderNumber.includes(query) ||
      customerName.includes(query) ||
      productNames.includes(query)
    );
  });

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

  const getPaymentStatusBadge = (status?: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return (
          <Badge className="bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]">
            Paid
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]">
            Pending
          </Badge>
        );
      case "UNPAID":
        return (
          <Badge className="bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3]">
            Unpaid
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]">
            Failed
          </Badge>
        );
      case "REFUNDED":
        return (
          <Badge className="bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]">
            Refunded
          </Badge>
        );
      default:
        return <Badge variant="outline">{status || "Pending"}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
            Manage Orders
          </h2>
          <p className="text-sm text-[#64748B] mt-1">
            Track and fulfill customer orders for your products ({totalOrders}{" "}
            total).
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchOrders()}
          disabled={isLoading}
          className="self-start sm:self-auto h-9 border-[#E5E7EB] text-[#374151] hover:bg-[#F8FAFC] cursor-pointer"
        >
          <RotateCcw
            className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* 2. Search & Filter Bar */}
      <Card className="p-4 border-[#E5E7EB] bg-white rounded-md shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search by Order ID, customer, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-md border-[#E5E7EB] text-sm text-[#0F172A] w-full"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 rounded-md border border-[#E5E7EB] bg-white text-xs font-medium text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Payment Method Filter */}
            <select
              value={selectedOrderType}
              onChange={(e) => {
                setSelectedOrderType(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 rounded-md border border-[#E5E7EB] bg-white text-xs font-medium text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
            >
              <option value="ALL">All Payment Types</option>
              <option value="COD">Cash on Delivery</option>
              <option value="ONLINE">Online Payment</option>
            </select>

            {/* Clear Filters */}
            {(selectedStatus !== "ALL" ||
              selectedOrderType !== "ALL" ||
              searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedStatus("ALL");
                  setSelectedOrderType("ALL");
                  setSearchQuery("");
                  setPage(1);
                }}
                className="text-xs text-[#EF4444] hover:bg-[#FEF2F2] h-10 px-2 cursor-pointer"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 3. Main Orders Table */}
      <Card className="border-[#E5E7EB] bg-white rounded-md shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#6366F1]" />
            <p className="text-sm font-medium text-[#64748B]">
              Loading vendor orders...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3 text-center">
            <AlertCircle className="w-10 h-10 text-[#EF4444]" />
            <p className="text-sm font-semibold text-[#0F172A]">
              Unable to load orders
            </p>
            <p className="text-xs text-[#64748B] max-w-md">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchOrders()}
              className="mt-2 text-xs"
            >
              Retry
            </Button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-3 text-center">
            <Package className="w-12 h-12 text-[#CBD5E1]" />
            <p className="text-base font-semibold text-[#0F172A]">
              No orders found
            </p>
            <p className="text-xs text-[#64748B] max-w-sm">
              {searchQuery ||
              selectedStatus !== "ALL" ||
              selectedOrderType !== "ALL"
                ? "No orders match your selected filters. Try adjusting your search or filters."
                : "You haven't received any customer orders yet. Newly placed orders for your products will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#F8FAFC]">
                <TableRow className="border-b border-[#E5E7EB]">
                  {/* 1. Product Name */}
                  <TableHead className="font-semibold text-xs text-[#475569] uppercase py-3.5 pl-6">
                    Product Name
                  </TableHead>
                  {/* 2. Order ID */}
                  <TableHead className="font-semibold text-xs text-[#475569] uppercase py-3.5">
                    Order ID
                  </TableHead>
                  {/* 3. Date */}
                  <TableHead className="font-semibold text-xs text-[#475569] uppercase py-3.5">
                    Date
                  </TableHead>
                  {/* 4. Customer Name */}
                  <TableHead className="font-semibold text-xs text-[#475569] uppercase py-3.5">
                    Customer Name
                  </TableHead>
                  {/* 5. Quantity */}
                  <TableHead className="font-semibold text-xs text-[#475569] uppercase py-3.5 text-center">
                    Quantity
                  </TableHead>
                  {/* 6. Order Status */}
                  <TableHead className="font-semibold text-xs text-[#475569] uppercase py-3.5 text-center">
                    Order Status
                  </TableHead>
                  {/* 7. Payment Method */}
                  <TableHead className="font-semibold text-xs text-[#475569] uppercase py-3.5">
                    Payment Method
                  </TableHead>
                  {/* 8. Payment Status */}
                  <TableHead className="font-semibold text-xs text-[#475569] uppercase py-3.5 text-center">
                    Payment Status
                  </TableHead>
                  {/* 9. Commission */}
                  <TableHead className="font-semibold text-xs text-[#475569] uppercase py-3.5 text-right">
                    Commission
                  </TableHead>
                  {/* 10. Amount */}
                  <TableHead className="font-semibold text-xs text-[#475569] uppercase py-3.5 text-right">
                    Amount
                  </TableHead>
                  {/* 11. Actions */}
                  <TableHead className="font-semibold text-xs text-[#475569] uppercase py-3.5 text-center pr-6">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-[#E5E7EB]">
                {filteredOrders.map((order) => {
                  const items = order.productItems || [];
                  const primaryItem = items[0];
                  const extraItemsCount = items.length - 1;

                  // Sum quantity of vendor's items in this order
                  const totalQuantity = items.reduce(
                    (sum, it) => sum + (Number(it.quantity) || 1),
                    0,
                  );

                  // Vendor relevant item amount
                  const vendorAmount = items.reduce(
                    (sum, it) =>
                      sum +
                      (Number(it.itemSubtotal) ||
                        Number(it.unitPrice * it.quantity) ||
                        0),
                    0,
                  );

                  // Vendor stored commission from order item in database
                  const hasCommissionData =
                    items.length > 0 &&
                    items.some(
                      (it) =>
                        it.adminCommission !== undefined &&
                        it.adminCommission !== null,
                    );
                  const vendorCommission = hasCommissionData
                    ? items.reduce(
                        (sum, it) => sum + (Number(it.adminCommission) || 0),
                        0,
                      )
                    : null;

                  const isCOD =
                    order.orderType === "COD" ||
                    order.payment?.paymentMethod === "COD";
                  const isOnline =
                    order.orderType === "ONLINE" ||
                    order.payment?.paymentMethod === "STRIPE";
                  const currentPaymentStatus = order.payment?.status;
                  const isPaymentPaid = currentPaymentStatus === "PAID";

                  // Check permitted status transitions
                  const allowedTransitions =
                    VALID_ORDER_STATUS_TRANSITIONS[order.status] || [];

                  // Check if eligible for COD payment confirmation
                  const isEligibleForCODConfirm =
                    isCOD &&
                    order.status === "DELIVERED" &&
                    !isPaymentPaid;

                  const isRowUpdatingStatus =
                    updatingOrderId === order._id && updatingType === "status";
                  const isRowUpdatingPayment =
                    updatingOrderId === order._id && updatingType === "payment";
                  const isRowBusy = updatingOrderId === order._id;

                  return (
                    <TableRow
                      key={order._id}
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >
                      {/* 1. Product Name */}
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md border border-[#E5E7EB] bg-[#F8FAFC] overflow-hidden shrink-0 flex items-center justify-center">
                            {primaryItem?.image ? (
                              <img
                                src={primaryItem.image}
                                alt={primaryItem.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-[#94A3B8]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#0F172A] truncate max-w-[180px]">
                              {primaryItem?.name || "Ordered Product"}
                            </p>
                            {extraItemsCount > 0 && (
                              <span className="text-xs text-[#6366F1] font-medium block">
                                +{extraItemsCount} more item
                                {extraItemsCount > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* 2. Order ID */}
                      <TableCell className="text-xs font-mono font-semibold text-[#0F172A] py-4">
                        #
                        {order.transactionNumber ||
                          order._id.slice(-6).toUpperCase()}
                      </TableCell>

                      {/* 3. Date */}
                      <TableCell className="text-xs text-[#475569] py-4 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>

                      {/* 4. Customer Name */}
                      <TableCell className="text-xs font-medium text-[#0F172A] py-4">
                        {order.buyer?.name ||
                          order.shippingAddress?.fullName ||
                          "Customer"}
                      </TableCell>

                      {/* 5. Quantity */}
                      <TableCell className="text-xs font-semibold text-[#0F172A] text-center py-4">
                        {totalQuantity}
                      </TableCell>

                      {/* 6. Order Status with Three-Dot Menu */}
                      <TableCell className="py-4">
                        <div className="flex items-center justify-center gap-1">
                          {getOrderStatusBadge(order.status)}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={isRowBusy}
                                className="h-7 w-7 p-0 rounded-md hover:bg-[#F1F5F9] text-[#64748B] cursor-pointer"
                                title="Update order status"
                              >
                                {isRowUpdatingStatus ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <MoreVertical className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48 bg-white"
                            >
                              <DropdownMenuLabel className="text-xs text-[#64748B]">
                                Change Order Status
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {allowedTransitions.length > 0 ? (
                                allowedTransitions.map((nextStatus) => (
                                  <DropdownMenuItem
                                    key={nextStatus}
                                    onClick={() =>
                                      handleUpdateStatus(order._id, nextStatus)
                                    }
                                    className="text-xs cursor-pointer font-medium hover:bg-[#F8FAFC]"
                                  >
                                    Mark as {nextStatus}
                                  </DropdownMenuItem>
                                ))
                              ) : (
                                <DropdownMenuItem
                                  disabled
                                  className="text-xs text-[#94A3B8]"
                                >
                                  {order.status === "DELIVERED" ||
                                  order.status === "CANCELLED"
                                    ? "Terminal state (No transitions)"
                                    : "No transitions available"}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>

                      {/* 7. Payment Method */}
                      <TableCell className="text-xs text-[#475569] py-4">
                        {isCOD ? "Cash on Delivery" : "Online Payment"}
                      </TableCell>

                      {/* 8. Payment Status with Three-Dot Menu */}
                      <TableCell className="py-4">
                        <div className="flex items-center justify-center gap-1">
                          {getPaymentStatusBadge(currentPaymentStatus)}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={isRowBusy}
                                className="h-7 w-7 p-0 rounded-md hover:bg-[#F1F5F9] text-[#64748B] cursor-pointer"
                                title="Payment options"
                              >
                                {isRowUpdatingPayment ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <MoreVertical className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-56 bg-white"
                            >
                              <DropdownMenuLabel className="text-xs text-[#64748B]">
                                Payment Actions
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {isOnline ? (
                                <DropdownMenuItem
                                  disabled
                                  className="text-xs text-[#94A3B8]"
                                >
                                  Online payment (Read-only)
                                </DropdownMenuItem>
                              ) : isPaymentPaid ? (
                                <DropdownMenuItem
                                  disabled
                                  className="text-xs text-[#94A3B8]"
                                >
                                  Payment completed (Paid)
                                </DropdownMenuItem>
                              ) : isEligibleForCODConfirm ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleConfirmCODPayment(order._id)
                                  }
                                  className="text-xs font-medium cursor-pointer text-[#059669] hover:bg-[#ECFDF5] flex items-center gap-1.5"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Mark as Paid
                                </DropdownMenuItem>
                              ) : isCOD ? (
                                <DropdownMenuItem
                                  disabled
                                  className="text-xs text-[#94A3B8]"
                                >
                                  Mark as Paid (Deliver order first)
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  disabled
                                  className="text-xs text-[#94A3B8]"
                                >
                                  No actions available
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>

                      {/* 9. Commission (from corresponding stored database order item) */}
                      <TableCell className="text-right py-4">
                        {vendorCommission !== null ? (
                          order.status === "DELIVERED" ? (
                            <span className="inline-flex items-center font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-sm border border-[#D1FAE5] text-xs">
                              {formatCurrency(vendorCommission)}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-[#475569]">
                              {formatCurrency(vendorCommission)}
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-[#94A3B8] font-medium">
                            —
                          </span>
                        )}
                      </TableCell>

                      {/* 10. Amount */}
                      <TableCell className="text-sm font-bold text-[#0F172A] text-right py-4">
                        {formatCurrency(vendorAmount)}
                      </TableCell>

                      {/* 11. Actions */}
                      <TableCell className="text-center pr-6 py-4">
                        <div className="flex items-center justify-center">
                          {/* View Details */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(order)}
                            className="w-8 h-8 rounded-md text-[#475569] hover:text-[#6366F1] hover:bg-[#EEF2FF] cursor-pointer"
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

        {/* 4. Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E7EB] bg-[#F8FAFC]">
            <p className="text-xs text-[#64748B]">
              Page {page} of {totalPages} ({totalOrders} orders)
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 text-xs rounded-md"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-8 text-xs rounded-md"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 5. Order Details Modal */}
      <OrderDetailsDialog
        order={selectedOrder}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
};

export default OrderListPage;
