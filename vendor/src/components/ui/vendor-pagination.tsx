import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface VendorPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  className?: string;
}

export const VendorPagination: React.FC<VendorPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  className,
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [1];
    if (currentPage > 3) pages.push("ellipsis");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
    return pages;
  };

  const isPrevDisabled = currentPage <= 1 || isLoading;
  const isNextDisabled = currentPage >= totalPages || isLoading;

  return (
    <Pagination className={cn("py-2", className)}>
      <PaginationContent className="gap-2">
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={isPrevDisabled}
            className={cn(
              "size-10 rounded-lg border border-neutral-200 bg-white shadow-none",
              isPrevDisabled
                ? "text-neutral-300 hover:bg-white cursor-not-allowed opacity-100 pointer-events-none"
                : "text-neutral-800 hover:bg-neutral-50 hover:text-neutral-900 cursor-pointer",
            )}
          />
        </PaginationItem>

        {getPageNumbers().map((item, idx) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis className="size-10 text-neutral-500" />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                isActive={item === currentPage}
                onClick={() => onPageChange(item)}
                disabled={isLoading}
                className={cn(
                  "size-10 rounded-lg text-sm font-medium shadow-none transition-colors cursor-pointer",
                  item === currentPage
                    ? "bg-[#ff6200] hover:bg-[#e55800] text-white border border-[#ff6200]"
                    : "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 hover:text-neutral-900",
                )}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={isNextDisabled}
            className={cn(
              "size-10 rounded-lg border border-neutral-200 bg-white shadow-none",
              isNextDisabled
                ? "text-neutral-300 hover:bg-white cursor-not-allowed opacity-100 pointer-events-none"
                : "text-neutral-800 hover:bg-neutral-50 hover:text-neutral-900 cursor-pointer",
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default VendorPagination;
