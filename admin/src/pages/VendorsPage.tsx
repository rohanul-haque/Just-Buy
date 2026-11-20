import VendorApproveDialog from "@/components/vendors/VendorApproveDialog";
import VendorDeleteDialog from "@/components/vendors/VendorDeleteDialog";
import VendorDetailsDialog from "@/components/vendors/VendorDetailsDialog";
import VendorSearch from "@/components/vendors/VendorSearch";
import VendorStatusFilter from "@/components/vendors/VendorStatusFilter";
import VendorSuspendDialog from "@/components/vendors/VendorSuspendDialog";
import VendorsTable from "@/components/vendors/VendorsTable";
import VendorTableSkeleton from "@/components/vendors/VendorTableSkeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { IVendor, VendorLoaderData } from "@/types/vendor";
import React, { useState } from "react";
import { useLoaderData, useNavigation, useSearchParams } from "react-router";

export const VendorsPage: React.FC = () => {
  const loaderData = useLoaderData() as VendorLoaderData | undefined;
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();

  const vendors = loaderData?.vendors ?? [];
  const pagination = loaderData?.pagination ?? null;
  const activeTab = loaderData?.tab ?? "requests";
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

  const handleTabChange = (nextTab: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (nextTab === "requests") {
      newParams.delete("tab");
    } else {
      newParams.set("tab", nextTab);
    }
    // Reset search, status and pagination when switching tabs
    newParams.delete("status");
    newParams.delete("search");
    newParams.delete("page");
    setSearchParams(newParams);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Heading */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
          Vendor
        </h2>
        <p className="text-sm text-[#4B5563] mt-1 font-normal">
          Manage vendor requests and monitor all registered vendors.
        </p>
      </div>

      {/* 2. Tabs Component */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full space-y-4"
      >
        <div className="border-b border-[#E5E7EB]">
          <TabsList className="bg-[#F8FAFC] p-1 rounded-md border border-[#E5E7EB] h-10">
            <TabsTrigger
              value="requests"
              className="rounded-md px-4 py-1.5 text-xs font-semibold data-[state=active]:bg-[#4F46E5] data-[state=active]:text-white data-[state=active]:shadow-xs transition-colors"
            >
              Vendor Requests
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="rounded-md px-4 py-1.5 text-xs font-semibold data-[state=active]:bg-[#4F46E5] data-[state=active]:text-white data-[state=active]:shadow-xs transition-colors"
            >
              Vendor List
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 3 & 4. Search Input and Status Filter Controls below Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <VendorSearch
              placeholder={
                activeTab === "requests"
                  ? "Search vendor requests..."
                  : "Search approved vendors..."
              }
            />
            <VendorStatusFilter activeTab={activeTab} />
          </div>
        </div>

        {/* 5. Main Vendor Data Table */}
        {isLoading ? (
          <VendorTableSkeleton rows={pagination?.limit || 8} />
        ) : (
          <VendorsTable
            vendors={vendors}
            pagination={pagination}
            activeTab={activeTab}
            currentPage={currentPage}
            onViewDetails={(v) => setSelectedVendorForDetails(v)}
            onApprove={(v) => setSelectedVendorForApprove(v)}
            onDeleteRequest={(v) => setSelectedVendorForDelete(v)}
            onSuspend={(v) => setSelectedVendorForSuspend(v)}
          />
        )}
      </Tabs>

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
