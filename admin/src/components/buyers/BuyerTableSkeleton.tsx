import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
            <TableHead className="w-16 text-xs font-semibold text-[#4B5563] uppercase">
              SL
            </TableHead>
            <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">
              Buyer Name
            </TableHead>
            <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">
              Email
            </TableHead>
            <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">
              Join Date
            </TableHead>
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
              <TableCell className="py-4">
                <Skeleton className="h-4 w-6 rounded-md" />
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-md flex-shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <Skeleton className="h-4 w-40 rounded-md" />
              </TableCell>
              <TableCell className="py-4">
                <Skeleton className="h-4 w-24 rounded-md" />
              </TableCell>
              <TableCell className="py-4 text-right">
                <div className="flex items-center justify-end gap-2">
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
