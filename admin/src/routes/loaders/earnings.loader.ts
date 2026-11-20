import earningsService from "@/api/services/earnings.service";
import type { EarningsLoaderData } from "@/types/earnings";
import type { LoaderFunctionArgs } from "react-router";

export const earningsLoader = async ({
  request,
}: LoaderFunctionArgs): Promise<EarningsLoaderData> => {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get("limit")) || 10),
  );

  try {
    const [summaryRes, transactionsRes] = await Promise.all([
      earningsService.getEarningsSummary(),
      earningsService.getEarningsTransactions({
        page,
        limit,
        search: search.trim() ? search.trim() : undefined,
      }),
    ]);

    return {
      summary: summaryRes.data || { todayIncome: 0, totalIncome: 0 },
      transactions: transactionsRes.data || [],
      pagination: transactionsRes.pagination || null,
      search,
      page,
    };
  } catch {
    return {
      summary: { todayIncome: 0, totalIncome: 0 },
      transactions: [],
      pagination: null,
      search,
      page,
    };
  }
};

export default earningsLoader;
