import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export const EarningsTableSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 2 Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card
            key={i}
            className="p-6 bg-white border-[#E5E7EB] rounded-md shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded-sm" />
                <Skeleton className="h-8 w-36 rounded-sm" />
                <Skeleton className="h-3 w-48 rounded-sm" />
              </div>
              <Skeleton className="h-12 w-12 rounded-md" />
            </div>
          </Card>
        ))}
      </div>

      {/* Search Input Skeleton */}
      <div className="flex items-center justify-end">
        <Skeleton className="h-10 w-full sm:w-80 rounded-md" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-md border border-[#E5E7EB] bg-white overflow-hidden shadow-xs">
        <div className="h-12 bg-[#F8FAFC] border-b border-[#E5E7EB] px-6 flex items-center justify-between">
          <Skeleton className="h-4 w-24 rounded-sm" />
          <Skeleton className="h-4 w-24 rounded-sm" />
          <Skeleton className="h-4 w-24 rounded-sm" />
          <Skeleton className="h-4 w-24 rounded-sm" />
          <Skeleton className="h-4 w-24 rounded-sm" />
          <Skeleton className="h-4 w-12 rounded-sm" />
        </div>
        <div className="divide-y divide-[#E5E7EB] px-6">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="py-4 flex items-center justify-between gap-4">
              <Skeleton className="h-6 w-32 rounded-sm" />
              <Skeleton className="h-4 w-28 rounded-sm" />
              <Skeleton className="h-4 w-20 rounded-sm" />
              <Skeleton className="h-6 w-20 rounded-sm" />
              <Skeleton className="h-4 w-24 rounded-sm" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EarningsTableSkeleton;
