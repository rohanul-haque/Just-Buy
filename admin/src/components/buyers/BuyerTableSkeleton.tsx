import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";

interface BuyerTableSkeletonProps {
  rows?: number;
}

export const BuyerTableSkeleton: React.FC<BuyerTableSkeletonProps> = ({
  rows = 5,
}) => {
  return (
    <div className="rounded-md border border-[#E5E7EB] bg-white overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-[#F8FAFC]">
          <TableRow className="border-b border-[#E5E7EB]">
            {/* 1. Buyer Image */}
            <TableHead className="w-24 text-xs font-semibold text-[#4B5563] uppercase">
              Buyer Image
            </TableHead>
            {/* 2. Buyer Name */}
            <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">
              Buyer Name
            </TableHead>
            {/* 3. Email */}
            <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">
              Email
            </TableHead>
            {/* 4. Role */}
            <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">
              Role
            </TableHead>
            {/* 5. Join Date */}
            <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">
              Join Date
            </TableHead>
            {/* 6. Actions */}
            <TableHead className="w-28 text-xs font-semibold text-[#4B5563] uppercase text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, idx) => (
            <TableRow
              key={idx}
              className="border-b border-[#E5E7EB] hover:bg-transparent"
            >
              {/* 1. Buyer Image */}
              <TableCell className="py-3">
                <Skeleton className="w-10 h-10 rounded-md" />
              </TableCell>
              {/* 2. Buyer Name */}
              <TableCell className="py-3">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-3 w-20 rounded-md" />
                </div>
              </TableCell>
              {/* 3. Email */}
              <TableCell className="py-3">
                <Skeleton className="h-4 w-40 rounded-md" />
              </TableCell>
              {/* 4. Role */}
              <TableCell className="py-3">
                <Skeleton className="h-5 w-16 rounded-md" />
              </TableCell>
              {/* 5. Join Date */}
              <TableCell className="py-3">
                <Skeleton className="h-4 w-24 rounded-md" />
              </TableCell>
              {/* 6. Actions */}
              <TableCell className="py-3 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Skeleton className="w-8 h-8 rounded-md" />
                  <Skeleton className="w-8 h-8 rounded-md" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BuyerTableSkeleton;
