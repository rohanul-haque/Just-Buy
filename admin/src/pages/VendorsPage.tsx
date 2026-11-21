import SummaryCard from "@/components/ui/SummaryCard";
import VendorApproveDialog from "@/components/vendors/VendorApproveDialog";
import VendorCategorySelect from "@/components/vendors/VendorCategorySelect";
import VendorDeleteDialog from "@/components/vendors/VendorDeleteDialog";
import VendorDetailsDialog from "@/components/vendors/VendorDetailsDialog";
import VendorSearch from "@/components/vendors/VendorSearch";
import VendorSuspendDialog from "@/components/vendors/VendorSuspendDialog";
import VendorsTable from "@/components/vendors/VendorsTable";
import VendorTableSkeleton from "@/components/vendors/VendorTableSkeleton";
import type { IVendor, TVendorCategory, VendorLoaderData } from "@/types/vendor";
import {
  AlertTriangle,
  Clock,
  FileText,
  Store,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { useLoaderData, useNavigation, useSearchParams } from "react-router";

export const VendorsPage: React.FC = () => {
  const loaderData = useLoaderData() as VendorLoaderData | undefined;
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();

  const vendors = loaderData?.vendors ?? [];
  const pagination = loaderData?.pagination ?? null;
  const category = loaderData?.category ?? "list";
  const currentPage = loaderData?.page ?? 1;
  const stats = loaderData?.statistics || {
    vendorList: 0,
    vendorRequests: 0,
    rejected: 0,
    suspended: 0,
    pending: 0,
  };

  // Track page transitions / loading state
  const isLoading = navigation.state === "loading";

  // Dialog states
  const [selectedVendorForDetails, setSelectedVendorForDetails] =
    useState<IVendor | null>(null);
  const [selectedVendorForApprove, setSelectedVendorForApprove] =
    useState<IVendor | null>(null);
  const [selectedVendorForDelete, setSelectedVendorForDelete] =
    useState<IVendor | null>(null);
  const [selectedVendorForSuspend, setSelectedVendorForSuspend] =
    useState<IVendor | null>(null);

  const handleCardClick = (cat: TVendorCategory) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === "list") {
      newParams.delete("category");
      newParams.delete("tab");
    } else {
      newParams.set("category", cat);
      newParams.delete("tab");
    }
    newParams.delete("status");
    newParams.delete("page");
    setSearchParams(newParams);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Heading */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
          Vendors
        </h2>
        <p className="text-sm text-[#4B5563] mt-1 font-normal">
          Manage vendor accounts, registration applications, and store approvals.
        </p>
      </div>

      {/* 2. Exactly Five Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        <SummaryCard
          title="Vendor List"
          value={stats.vendorList.toLocaleString("en-US")}
          icon={<Store />}
          iconBackgroundColor="bg-[#10B981]"
          onClick={() => handleCardClick("list")}
          isActive={category === "list"}
        />
        <SummaryCard
          title="Vendor Requests"
          value={stats.vendorRequests.toLocaleString("en-US")}
          icon={<FileText />}
          iconBackgroundColor="bg-[#3B82F6]"
          onClick={() => handleCardClick("requests")}
          isActive={category === "requests"}
        />
        <SummaryCard
          title="Rejected"
          value={stats.rejected.toLocaleString("en-US")}
          icon={<XCircle />}
          iconBackgroundColor="bg-[#EF4444]"
          onClick={() => handleCardClick("rejected")}
          isActive={category === "rejected"}
        />
        <SummaryCard
          title="Suspended"
          value={stats.suspended.toLocaleString("en-US")}
          icon={<AlertTriangle />}
          iconBackgroundColor="bg-[#F97316]"
          onClick={() => handleCardClick("suspended")}
          isActive={category === "suspended"}
        />
        <SummaryCard
          title="Pending"
          value={stats.pending.toLocaleString("en-US")}
          icon={<Clock />}
          iconBackgroundColor="bg-[#8B5CF6]"
          onClick={() => handleCardClick("pending")}
          isActive={category === "pending"}
        />
      </div>

      {/* 3. Controls: Search Input + Select Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="flex-1 min-w-0">
          <VendorSearch
            placeholder={
              category === "requests"
                ? "Search vendor requests..."
                : category === "pending"
                  ? "Search pending requests..."
                  : category === "rejected"
                    ? "Search rejected vendors..."
                    : category === "suspended"
                      ? "Search suspended vendors..."
                      : "Search vendors..."
            }
          />
        </div>

        {/* Category Select Dropdown */}
        <VendorCategorySelect category={category} />
      </div>

      {/* 4. Main Vendor Data Table */}
      {isLoading ? (
        <VendorTableSkeleton rows={pagination?.limit || 8} />
      ) : (
        <VendorsTable
          vendors={vendors}
          pagination={pagination}
          category={category}
          currentPage={currentPage}
          onViewDetails={(v) => setSelectedVendorForDetails(v)}
          onApprove={(v) => setSelectedVendorForApprove(v)}
          onDeleteRequest={(v) => setSelectedVendorForDelete(v)}
          onSuspend={(v) => setSelectedVendorForSuspend(v)}
        />
      )}

      {/* Vendor Details Modal */}
      <VendorDetailsDialog
        open={!!selectedVendorForDetails}
        vendor={selectedVendorForDetails}
        onOpenChange={(open) => {
          if (!open) setSelectedVendorForDetails(null);
        }}
      />

      {/* Vendor Approve Modal */}
      <VendorApproveDialog
        open={!!selectedVendorForApprove}
        vendor={selectedVendorForApprove}
        onOpenChange={(open) => {
          if (!open) setSelectedVendorForApprove(null);
        }}
      />

      {/* Vendor Delete / Reject Request Modal */}
      <VendorDeleteDialog
        open={!!selectedVendorForDelete}
        vendor={selectedVendorForDelete}
        onOpenChange={(open) => {
          if (!open) setSelectedVendorForDelete(null);
        }}
      />

      {/* Vendor Suspend / Unsuspend Modal */}
      <VendorSuspendDialog
        open={!!selectedVendorForSuspend}
        vendor={selectedVendorForSuspend}
        onOpenChange={(open) => {
          if (!open) setSelectedVendorForSuspend(null);
        }}
      />
    </div>
  );
};

export default VendorsPage;
