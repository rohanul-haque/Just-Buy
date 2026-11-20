import buyerService from "@/api/services/buyer.service";
import type { BuyerLoaderData } from "@/types/buyer";
import type { LoaderFunctionArgs } from "react-router";

export const buyersLoader = async ({
  request,
}: LoaderFunctionArgs): Promise<BuyerLoaderData> => {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 10));

  try {
    const response = await buyerService.getAllBuyers({
      search: search.trim() ? search.trim() : undefined,
      page,
      limit,
    });

    return {
      buyers: response.data || [],
      pagination: response.pagination || null,
      search,
      page,
    };
  } catch {
    return {
      buyers: [],
      pagination: null,
      search,
      page,
    };
  }
};

export default buyersLoader;
