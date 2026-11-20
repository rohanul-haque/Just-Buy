import vendorService from "@/api/services/vendor.service";
import type { VendorLoaderData, VendorStatus } from "@/types/vendor";
import type { LoaderFunctionArgs } from "react-router";

export const vendorsLoader = async ({
  request,
}: LoaderFunctionArgs): Promise<VendorLoaderData> => {
  const url = new URL(request.url);
  const rawTab = url.searchParams.get("tab");
  const tab: "requests" | "list" = rawTab === "requests" ? "requests" : "list";
  const search = url.searchParams.get("search") || "";
  const rawStatus = url.searchParams.get("status") || "";
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get("limit")) || 10),
  );

  let statusParam: VendorStatus | "ALL" | undefined;
  const tabParam: "requests" | "approved" =
    tab === "list" ? "approved" : "requests";

  if (tab === "requests") {
    // In Vendor Requests tab, default view is PENDING unless another supported request status is chosen
    if (
      rawStatus === "REJECTED" ||
      rawStatus === "SUSPENDED" ||
      rawStatus === "PENDING" ||
      rawStatus === "ALL"
    ) {
      statusParam = rawStatus as VendorStatus | "ALL";
    } else {
      statusParam = "PENDING";
    }
  } else {
    // In Vendor List tab, only APPROVED vendors are displayed
    statusParam = "APPROVED";
  }

  try {
    const response = await vendorService.getAllVendors({
      search: search.trim() ? search.trim() : undefined,
      status: statusParam,
      tab: tabParam,
      page,
      limit,
    });

    return {
      vendors: response.data || [],
      pagination: response.pagination || null,
      tab,
      search,
      status: rawStatus,
      page,
    };
  } catch {
    return {
      vendors: [],
      pagination: null,
      tab,
      search,
      status: rawStatus,
      page,
    };
  }
};

export default vendorsLoader;
