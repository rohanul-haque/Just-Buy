import BuyerDeleteDialog from "@/components/buyers/BuyerDeleteDialog";
import BuyerDetailsDialog from "@/components/buyers/BuyerDetailsDialog";
import BuyerSearch from "@/components/buyers/BuyerSearch";
import BuyerStatusFilter from "@/components/buyers/BuyerStatusFilter";
import BuyersTable from "@/components/buyers/BuyersTable";
import BuyerTableSkeleton from "@/components/buyers/BuyerTableSkeleton";
import SummaryCard from "@/components/ui/SummaryCard";
import type { BuyerLoaderData, IBuyer } from "@/types/buyer";
import { UserCheck, Users, UserX } from "lucide-react";
import React, { useState } from "react";
import { useLoaderData, useNavigation } from "react-router";

export const BuyersPage: React.FC = () => {
  const loaderData = useLoaderData() as BuyerLoaderData | undefined;
  const navigation = useNavigation();

  const buyers = loaderData?.buyers ?? [];
  const pagination = loaderData?.pagination ?? null;
  const currentPage = loaderData?.page ?? 1;
  const stats = loaderData?.statistics || {
    totalBuyers: 0,
    active: 0,
    blocked: 0,
  };

  // Track page transitions / loading state
  const isLoading = navigation.state === "loading";

  // Modal dialog states
  const [selectedBuyerForDetails, setSelectedBuyerForDetails] =
    useState<IBuyer | null>(null);
  const [selectedBuyerForDelete, setSelectedBuyerForDelete] =
    useState<IBuyer | null>(null);

  return (
    <div className="space-y-6">
      {/* 1. Exactly Three Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <SummaryCard
          title="Total Buyers"
          value={stats.totalBuyers.toLocaleString("en-US")}
          icon={<Users />}
          iconBackgroundColor="bg-[#3B82F6]"
        />
        <SummaryCard
          title="Blocked"
          value={stats.blocked.toLocaleString("en-US")}
          icon={<UserX />}
          iconBackgroundColor="bg-[#EF4444]"
        />
        <SummaryCard
          title="Active"
          value={stats.active.toLocaleString("en-US")}
          icon={<UserCheck />}
          iconBackgroundColor="bg-[#10B981]"
        />
      </div>

      {/* 2. Search and Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        <BuyerSearch className="flex-1 w-full" />
        <BuyerStatusFilter className="w-full sm:w-48 shrink-0" />
      </div>

      {/* 3. Main Table Content */}
      {isLoading && !loaderData ? (
        <BuyerTableSkeleton rows={pagination?.limit || 10} />
      ) : (
        <BuyersTable
          buyers={buyers}
          pagination={pagination}
          currentPage={currentPage}
          isLoading={isLoading}
          onViewDetails={(buyer) => setSelectedBuyerForDetails(buyer)}
          onSoftDelete={(buyer) => setSelectedBuyerForDelete(buyer)}
        />
      )}

      {/* Buyer Details Modal */}
      <BuyerDetailsDialog
        open={!!selectedBuyerForDetails}
        buyer={selectedBuyerForDetails}
        onOpenChange={(open) => {
          if (!open) setSelectedBuyerForDetails(null);
        }}
      />

      {/* Soft Delete / Block Confirmation Modal */}
      <BuyerDeleteDialog
        open={!!selectedBuyerForDelete}
        buyer={selectedBuyerForDelete}
        onOpenChange={(open) => {
          if (!open) setSelectedBuyerForDelete(null);
        }}
      />
    </div>
  );
};

export default BuyersPage;
