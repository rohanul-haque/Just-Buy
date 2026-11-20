import BuyerDeleteDialog from "@/components/buyers/BuyerDeleteDialog";
import BuyerDetailsDialog from "@/components/buyers/BuyerDetailsDialog";
import BuyerSearch from "@/components/buyers/BuyerSearch";
import BuyerStatusFilter from "@/components/buyers/BuyerStatusFilter";
import BuyersTable from "@/components/buyers/BuyersTable";
import BuyerTableSkeleton from "@/components/buyers/BuyerTableSkeleton";
import type { BuyerLoaderData, IBuyer } from "@/types/buyer";
import React, { useState } from "react";
import { useLoaderData, useNavigation } from "react-router";

export const BuyersPage: React.FC = () => {
  const loaderData = useLoaderData() as BuyerLoaderData | undefined;
  const navigation = useNavigation();

  const buyers = loaderData?.buyers ?? [];
  const pagination = loaderData?.pagination ?? null;
  const currentPage = loaderData?.page ?? 1;

  // Track page transitions / loading state
  const isLoading = navigation.state === "loading";

  // Modal dialog states
  const [selectedBuyerForDetails, setSelectedBuyerForDetails] =
    useState<IBuyer | null>(null);
  const [selectedBuyerForDelete, setSelectedBuyerForDelete] =
    useState<IBuyer | null>(null);

  return (
    <div className="space-y-6">
      {/* Page Header and Controls in One Row on the Same Horizontal Line */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
            Buyers
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <BuyerSearch />
          <BuyerStatusFilter />
        </div>
      </div>

      {/* Main Table Content */}
      {isLoading ? (
        <BuyerTableSkeleton rows={pagination?.limit || 8} />
      ) : (
        <BuyersTable
          buyers={buyers}
          pagination={pagination}
          currentPage={currentPage}
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
