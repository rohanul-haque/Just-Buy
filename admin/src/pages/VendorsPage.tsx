import SummaryCard from "@/components/ui/SummaryCard";
import VendorApproveDialog from "@/components/vendors/VendorApproveDialog";
import VendorCategorySelect from "@/components/vendors/VendorCategorySelect";
import VendorDeleteDialog from "@/components/vendors/VendorDeleteDialog";
import VendorDetailsDialog from "@/components/vendors/VendorDetailsDialog";
import VendorSearch from "@/components/vendors/VendorSearch";
import VendorSuspendDialog from "@/components/vendors/VendorSuspendDialog";
import VendorsTable from "@/components/vendors/VendorsTable";
import VendorTableSkeleton from "@/components/vendors/VendorTableSkeleton";
import type { IVendor, VendorLoaderData } from "@/types/vendor";
import {
  AlertTriangle,
  FileText,
  Store,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { useLoaderData, useNavigation } from "react-router";

export const VendorsPage: React.FC = () => {
  const loaderData = useLoaderData() as VendorLoaderData | undefined;
  const navigation = useNavigation();

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

  return (
    <div className="space-y-6">
      {/* 1. Exactly Four Summary Cards (Informational Only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <SummaryCard
          title="Vendor List"
          value={stats.vendorList.toLocaleString("en-US")}
          icon={<Store />}
          iconBackgroundColor="bg-[#10B981]"
        />
        <SummaryCard
          title="Vendor Requests"
          value={stats.vendorRequests.toLocaleString("en-US")}
          icon={<FileText />}
          iconBackgroundColor="bg-[#3B82F6]"
        />
        <SummaryCard
          title="Rejected"
          value={stats.rejected.toLocaleString("en-US")}
          icon={<XCircle />}
          iconBackgroundColor="bg-[#EF4444]"
        />
        <SummaryCard
          title="Suspended"
          value={stats.suspended.toLocaleString("en-US")}
          icon={<AlertTriangle />}
          iconBackgroundColor="bg-[#F97316]"
        />
      </div>

      {/* 2. Controls: Search Input + Select Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        {/* Search Input */}
        <div className="flex-1 min-w-0">
          <VendorSearch
            placeholder={
              category === "requests"
                ? "Search vendor requests..."
                : category === "rejected"
                  ? "Search rejected vendors..."
                  : category === "suspended"
                    ? "Search suspended vendors..."
                    : "Search vendors..."
            }
          />
        </div>

        {/* Category Select Dropdown */}
        <VendorCategorySelect category={category} className="w-full sm:w-52 shrink-0" />
      </div>

      {/* 3. Main Vendor Data Table */}
      {isLoading && !loaderData ? (
        <VendorTableSkeleton rows={pagination?.limit || 10} />
      ) : (
        <VendorsTable
          vendors={vendors}
          pagination={pagination}
          category={category}
          currentPage={currentPage}
          isLoading={isLoading}
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
