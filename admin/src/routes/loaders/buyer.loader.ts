import buyerService from "@/api/services/buyer.service";
import type { BuyerLoaderData } from "@/types/buyer";
import type { LoaderFunctionArgs } from "react-router";

export const buyersLoader = async ({
  request,
}: LoaderFunctionArgs): Promise<BuyerLoaderData> => {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const rawStatus = url.searchParams.get("status") || "";
  const status =
    rawStatus === "ACTIVE" || rawStatus === "BLOCKED" ? rawStatus : "";
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get("limit")) || 10),
  );

  try {
    const [buyersRes, statsRes] = await Promise.all([
      buyerService.getAllBuyers({
        search: search.trim() ? search.trim() : undefined,
        status: status ? (status as "ACTIVE" | "BLOCKED") : undefined,
        page,
        limit,
      }),
      buyerService.getBuyerStatistics().catch(() => ({
        data: { totalBuyers: 0, active: 0, blocked: 0 },
      })),
    ]);

    return {
      buyers: buyersRes.data || [],
      pagination: buyersRes.pagination || null,
      statistics: statsRes.data || { totalBuyers: 0, active: 0, blocked: 0 },
      search,
      status,
      page,
    };
  } catch {
    return {
      buyers: [],
      pagination: null,
      statistics: { totalBuyers: 0, active: 0, blocked: 0 },
      search,
      status,
      page,
    };
  }
};

export default buyersLoader;
