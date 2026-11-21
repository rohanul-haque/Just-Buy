import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 4 Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="rounded-md p-6 border-[#E5E7EB] bg-white flex flex-col justify-between shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton: 2 Columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <Card className="rounded-md border-[#E5E7EB] bg-white p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-64 w-full rounded-md" />
          </Card>
        </div>
        <div className="lg:col-span-5">
          <Card className="rounded-md border-[#E5E7EB] bg-white p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="flex items-center justify-center py-6">
              <Skeleton className="h-44 w-44 rounded-full" />
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Users Table Skeleton */}
      <Card className="rounded-md p-6 border-[#E5E7EB] bg-white space-y-4">
        <div className="space-y-1.5 pb-2 border-b border-[#E5E7EB]">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-64" />
        </div>
        <div className="space-y-3 py-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-md" />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DashboardSkeleton;
