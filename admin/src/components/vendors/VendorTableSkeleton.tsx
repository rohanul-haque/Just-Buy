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

interface VendorTableSkeletonProps {
  rows?: number;
}

export const VendorTableSkeleton: React.FC<VendorTableSkeletonProps> = ({
  rows = 5,
}) => {
  return (
    <div className="rounded-md border border-[#E5E7EB] bg-white overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-[#F8FAFC]">
          <TableRow className="border-b border-[#E5E7EB]">
            {/* 1. Vendor Name */}
            <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">
              Vendor Name
            </TableHead>
            {/* 2. Email */}
            <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">
              Email
            </TableHead>
            {/* 3. Join Date */}
            <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">
              Join Date
            </TableHead>
            {/* 4. Status */}
            <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">
              Status
            </TableHead>
            {/* 5. Actions */}
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
              {/* 1. Vendor Name (Image + Name together) */}
              <TableCell className="py-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-md flex-shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                </div>
              </TableCell>
              {/* 2. Email */}
              <TableCell className="py-3">
                <Skeleton className="h-4 w-40 rounded-md" />
              </TableCell>
              {/* 3. Join Date */}
              <TableCell className="py-3">
                <Skeleton className="h-4 w-24 rounded-md" />
              </TableCell>
              {/* 4. Status */}
              <TableCell className="py-3">
                <Skeleton className="h-5 w-20 rounded-md" />
              </TableCell>
              {/* 5. Actions */}
              <TableCell className="py-3 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Skeleton className="w-8 h-8 rounded-md" />
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

export default VendorTableSkeleton;
