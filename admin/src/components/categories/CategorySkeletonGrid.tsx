import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

interface CategorySkeletonGridProps {
  count?: number;
}

export const CategorySkeletonGrid: React.FC<CategorySkeletonGridProps> = ({
  count = 8,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <Card
          key={idx}
          className="bg-white rounded-md p-5 border-[#E5E7EB] space-y-4"
        >
          <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-md mx-auto" />
          <Skeleton className="h-4 rounded-md w-3/4 mx-auto" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-9 rounded-md flex-1" />
            <Skeleton className="h-9 rounded-md flex-1" />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CategorySkeletonGrid;
