import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 4 Summary Cards Skeleton (Horizontal reference layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="p-5 bg-white border border-[#E5E7EB] rounded-xl shadow-xs"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-md shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-28" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton: 2 Columns on desktop (8 / 4 span) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card className="rounded-md border-[#E5E7EB] bg-white p-6 space-y-6">
            <div className="pb-4 border-b border-[#E5E7EB]">
              <Skeleton className="h-6 w-28" />
            </div>
            <Skeleton className="h-72 w-full rounded-md" />
          </Card>
        </div>
        <div className="lg:col-span-4">
          <Card className="rounded-md border-[#E5E7EB] bg-white p-6 space-y-6">
            <div className="pb-4 border-b border-[#E5E7EB]">
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="flex items-center justify-center py-6">
              <Skeleton className="h-44 w-44 rounded-full" />
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Users Table Skeleton */}
      <Card className="rounded-md border border-[#E5E7EB] bg-white p-6 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </Card>
    </div>
  );
};

export default DashboardSkeleton;
