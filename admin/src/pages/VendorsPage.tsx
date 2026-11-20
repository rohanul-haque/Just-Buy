import VendorApproveDialog from "@/components/vendors/VendorApproveDialog";
import VendorCategorySelect from "@/components/vendors/VendorCategorySelect";
import VendorDeleteDialog from "@/components/vendors/VendorDeleteDialog";
import VendorDetailsDialog from "@/components/vendors/VendorDetailsDialog";
import VendorSearch from "@/components/vendors/VendorSearch";
import VendorSuspendDialog from "@/components/vendors/VendorSuspendDialog";
import VendorsTable from "@/components/vendors/VendorsTable";
import VendorTableSkeleton from "@/components/vendors/VendorTableSkeleton";
import type { IVendor, VendorLoaderData } from "@/types/vendor";
import React, { useState } from "react";
import { useLoaderData, useNavigation } from "react-router";

export const VendorsPage: React.FC = () => {
  const loaderData = useLoaderData() as VendorLoaderData | undefined;
  const navigation = useNavigation();

  const vendors = loaderData?.vendors ?? [];
  const pagination = loaderData?.pagination ?? null;
  const category = loaderData?.category ?? "list";
  const currentPage = loaderData?.page ?? 1;

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
      {/* Page Header and Controls: Vendors → Search Input → Select Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* 1. Page Heading: Vendors */}
        <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A] shrink-0 whitespace-nowrap">
          Vendors
        </h2>

        {/* 2. Search Input (expands and occupies available remaining space) */}
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

        {/* 3. Category Select Dropdown (consistent width) */}
        <VendorCategorySelect category={category} />
      </div>

      {/* Main Vendor Data Table */}
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
