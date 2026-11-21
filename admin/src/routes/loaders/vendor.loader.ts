import vendorService from "@/api/services/vendor.service";
import type {
  TVendorCategory,
  VendorLoaderData,
  VendorStatus,
} from "@/types/vendor";
import type { LoaderFunctionArgs } from "react-router";

export const vendorsLoader = async ({
  request,
}: LoaderFunctionArgs): Promise<VendorLoaderData> => {
  const url = new URL(request.url);
  const rawCategory = (
    url.searchParams.get("category") ||
    url.searchParams.get("tab") ||
    url.searchParams.get("status") ||
    ""
  ).toLowerCase();

  let category: TVendorCategory;
  if (rawCategory === "requests") {
    category = "requests";
  } else if (rawCategory === "rejected") {
    category = "rejected";
  } else if (rawCategory === "suspended") {
    category = "suspended";
  } else if (rawCategory === "pending") {
    category = "pending";
  } else {
    category = "list";
  }

  const search = url.searchParams.get("search") || "";
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get("limit")) || 10),
  );

  let statusParam: VendorStatus | "ALL" | undefined;
  let tabParam: "requests" | "approved" | undefined;

  switch (category) {
    case "list":
      // Vendor List: only approved vendors
      statusParam = "APPROVED";
      tabParam = "approved";
      break;
    case "requests":
      // Vendor Requests: submitted vendor requests
      tabParam = "requests";
      break;
    case "rejected":
      // Rejected: vendors whose status is Rejected
      statusParam = "REJECTED";
      break;
    case "suspended":
      // Suspended: vendors whose status is Suspended
      statusParam = "SUSPENDED";
      break;
    case "pending":
      // Pending: vendors whose status is Pending
      statusParam = "PENDING";
      break;
  }

  try {
    const [response, statsRes] = await Promise.all([
      vendorService.getAllVendors({
        search: search.trim() ? search.trim() : undefined,
        status: statusParam,
        tab: tabParam,
        page,
        limit,
      }),
      vendorService.getVendorStatistics().catch(() => ({
        data: {
          vendorList: 0,
          vendorRequests: 0,
          rejected: 0,
          suspended: 0,
          pending: 0,
        },
      })),
    ]);

    return {
      vendors: response.data || [],
      pagination: response.pagination || null,
      statistics: statsRes.data || {
        vendorList: 0,
        vendorRequests: 0,
        rejected: 0,
        suspended: 0,
        pending: 0,
      },
      category,
      tab: category === "requests" ? "requests" : "list",
      search,
      status: statusParam || "",
      page,
    };
  } catch {
    return {
      vendors: [],
      pagination: null,
      statistics: {
        vendorList: 0,
        vendorRequests: 0,
        rejected: 0,
        suspended: 0,
        pending: 0,
      },
      category,
      tab: category === "requests" ? "requests" : "list",
      search,
      status: statusParam || "",
      page,
    };
  }
};

export default vendorsLoader;
