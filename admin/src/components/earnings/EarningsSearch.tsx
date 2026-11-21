import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";

interface EarningsSearchProps {
  placeholder?: string;
  className?: string;
}

export const EarningsSearch: React.FC<EarningsSearchProps> = ({
  placeholder = "Search by transaction ID or buyer name...",
  className = "",
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentQuery = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(currentQuery);
  const isFirstRender = useRef(true);

  useEffect(() => {
    setSearchTerm(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const handler = setTimeout(() => {
      const trimmed = searchTerm.trim();
      const newParams = new URLSearchParams(searchParams);

      if (trimmed) {
        newParams.set("search", trimmed);
      } else {
        newParams.delete("search");
      }
      newParams.delete("page");

      if ((searchParams.get("search") || "") !== trimmed) {
        setSearchParams(newParams, { replace: true });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, searchParams, setSearchParams]);

  const handleClear = () => {
    setSearchTerm("");
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("search");
    newParams.delete("page");
    setSearchParams(newParams, { replace: true });
  };

  return (
    <div className={`relative w-full ${className}`}>
      <Search className="w-4 h-4 text-[#4B5563] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <Input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 h-10 rounded-md bg-white border-[#E5E7EB] text-sm text-[#0F172A] placeholder:text-[#9CA3AF] focus-visible:ring-1 focus-visible:ring-[#4F46E5] focus-visible:border-[#4F46E5]"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] p-1 rounded-md"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default EarningsSearch;
