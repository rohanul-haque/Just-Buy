import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle,
  Eye,
  Loader2,
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
  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const response = await orderService.updateOrderStatus(orderId, nextStatus);
      if (response.success) {
        toast.success(response.message || `Order status updated to ${nextStatus}!`);
        await fetchOrders();
      } else {
        toast.error(response.message || "Failed to update order status.");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Handle Cash On Delivery (COD) Payment Confirmation
  const handleConfirmCODPayment = async (orderId: string) => {
    setUpdatingOrderId(orderId);
    try {
      const response = await orderService.confirmCODPayment(orderId);
      if (response.success) {
        toast.success(response.message || "COD payment confirmed successfully!");
        await fetchOrders();
      } else {
        toast.error(response.message || "Failed to confirm COD payment.");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Open Details Modal
  const handleViewDetails = (order: IOrder) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  // Filter orders by search query locally
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const orderNumber = (order.transactionNumber || order._id).toLowerCase();
    const customerName = (order.buyer?.name || order.shippingAddress?.fullName || "").toLowerCase();
    const productNames = (order.productItems || []).map((i) => i.name.toLowerCase()).join(" ");
    return (
      orderNumber.includes(query) ||
      customerName.includes(query) ||
      productNames.includes(query)
    );
  });

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]">Pending</Badge>;
      case "CONFIRMED":
        return <Badge className="bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]">Confirmed</Badge>;
      case "PROCESSING":
        return <Badge className="bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]">Processing</Badge>;
      case "SHIPPED":
        return <Badge className="bg-[#ECFEFF] text-[#0891B2] border-[#A5F3FC]">Shipped</Badge>;
      case "DELIVERED":
        return <Badge className="bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]">Delivered</Badge>;
      case "CANCELLED":
        return <Badge className="bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status?: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]">Paid</Badge>;
      case "PENDING":
        return <Badge className="bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]">Pending</Badge>;
      case "FAILED":
        return <Badge className="bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]">Failed</Badge>;
      case "REFUNDED":
        return <Badge className="bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]">Refunded</Badge>;
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
            Track and fulfill customer orders for your products ({totalOrders} total).
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchOrders()}
          disabled={isLoading}
          className="self-start sm:self-auto h-9 border-[#E5E7EB] text-[#374151] hover:bg-[#F8FAFC] cursor-pointer"
        >
          <RotateCcw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
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
            {(selectedStatus !== "ALL" || selectedOrderType !== "ALL" || searchQuery) && (
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
            <p className="text-sm font-medium text-[#64748B]">Loading vendor orders...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3 text-center">
            <AlertCircle className="w-10 h-10 text-[#EF4444]" />
            <p className="text-sm font-semibold text-[#0F172A]">Unable to load orders</p>
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
            <p className="text-base font-semibold text-[#0F172A]">No orders found</p>
            <p className="text-xs text-[#64748B] max-w-sm">
              {searchQuery || selectedStatus !== "ALL" || selectedOrderType !== "ALL"
                ? "No orders match your selected filters. Try adjusting your search or filters."
                : "You haven't received any customer orders yet. Newly placed orders for your products will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#F8FAFC]">
                <TableRow className="border-b border-[#E5E7EB]">
                  <TableHead className="font-semibold text-xs text-[#475569] uppercase py-3.5 pl-6">
                    Product Name
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-[#475569] uppercase py-3.5">
                    Order ID
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-[#475569] uppercase py-3.5">
                    Date
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-[#475569] uppercase py-3.5">
                    Customer Name
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-[#475569] uppercase py-3.5 text-center">
                    Quantity
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-[#475569] uppercase py-3.5 text-center">
                    Order Status
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-[#475569] uppercase py-3.5">
                    Payment Method
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-[#475569] uppercase py-3.5 text-center">
                    Payment Status
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-[#475569] uppercase py-3.5 text-right">
                    Amount
                  </TableHead>
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

                  const isCOD =
                    order.orderType === "COD" ||
                    order.payment?.paymentMethod === "COD";

                  // Check permitted status transitions
                  const allowedTransitions =
                    VALID_ORDER_STATUS_TRANSITIONS[order.status] || [];

                  // Check if eligible for COD payment confirmation
                  const isEligibleForCODConfirm =
                    isCOD &&
                    order.status === "DELIVERED" &&
                    order.payment?.status !== "PAID";

                  const isRowUpdating = updatingOrderId === order._id;

                  return (
                    <TableRow
                      key={order._id}
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >
                      {/* Product Name */}
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
                                +{extraItemsCount} more item{extraItemsCount > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Order ID */}
                      <TableCell className="text-xs font-mono font-semibold text-[#0F172A] py-4">
                        #{order.transactionNumber || order._id.slice(-6).toUpperCase()}
                      </TableCell>

                      {/* Date */}
                      <TableCell className="text-xs text-[#475569] py-4 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>

                      {/* Customer Name */}
                      <TableCell className="text-xs font-medium text-[#0F172A] py-4">
                        {order.buyer?.name || order.shippingAddress?.fullName || "Customer"}
                      </TableCell>

                      {/* Quantity */}
                      <TableCell className="text-xs font-semibold text-[#0F172A] text-center py-4">
                        {totalQuantity}
                      </TableCell>

                      {/* Order Status */}
                      <TableCell className="text-center py-4">
                        {getOrderStatusBadge(order.status)}
                      </TableCell>

                      {/* Payment Method */}
                      <TableCell className="text-xs text-[#475569] py-4">
                        {isCOD ? "Cash on Delivery" : "Online Payment"}
                      </TableCell>

                      {/* Payment Status */}
                      <TableCell className="text-center py-4">
                        {getPaymentStatusBadge(order.payment?.status)}
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="text-sm font-bold text-[#0F172A] text-right py-4">
                        ${vendorAmount.toFixed(2)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-center pr-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
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

                          {/* Order Status Transitions Dropdown */}
                          {allowedTransitions.length > 0 ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isRowUpdating}
                                  className="h-8 text-xs font-medium rounded-md border-[#E5E7EB] hover:bg-[#F8FAFC] cursor-pointer"
                                >
                                  {isRowUpdating ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <>
                                      <span>Status</span>
                                      <ArrowUpDown className="w-3 h-3 ml-1 text-[#94A3B8]" />
                                    </>
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44 bg-white">
                                <DropdownMenuLabel className="text-xs text-[#64748B]">
                                  Update Order Status
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {allowedTransitions.map((nextStatus) => (
                                  <DropdownMenuItem
                                    key={nextStatus}
                                    onClick={() => handleUpdateStatus(order._id, nextStatus)}
                                    className="text-xs cursor-pointer font-medium"
                                  >
                                    Move to {nextStatus}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="text-[11px] text-[#94A3B8] italic">
                              Terminal
                            </span>
                          )}

                          {/* Confirm COD Payment button (only if eligible) */}
                          {isEligibleForCODConfirm && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleConfirmCODPayment(order._id)}
                              disabled={isRowUpdating}
                              className="h-8 px-2 text-xs bg-[#059669] hover:bg-[#047857] text-white rounded-md cursor-pointer shadow-xs"
                              title="Confirm Cash on Delivery Payment"
                            >
                              {isRowUpdating ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          )}
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
