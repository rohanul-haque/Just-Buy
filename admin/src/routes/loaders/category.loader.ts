import categoryService from "@/api/services/category.service";
import type { ICategory, ICategoryStatistics } from "@/types/category";
import type { LoaderFunctionArgs } from "react-router";

export interface CategoryLoaderData {
  categories: ICategory[];
  statistics?: ICategoryStatistics;
  status?: string;
  search?: string;
}

export const categoriesLoader = async ({
  request,
}: LoaderFunctionArgs = {} as LoaderFunctionArgs): Promise<CategoryLoaderData> => {
  const url = request?.url ? new URL(request.url) : null;
  const search = url?.searchParams.get("search") || "";
  const rawStatus = (
    url?.searchParams.get("status") ||
    url?.searchParams.get("filter") ||
    "all"
  ).toLowerCase();

  let isActiveParam: boolean | "all" = "all";
  if (rawStatus === "active") {
    isActiveParam = true;
  } else if (rawStatus === "inactive") {
    isActiveParam = false;
  }

  try {
    const [response, statsRes] = await Promise.all([
      categoryService.getAllCategories({
        isActive: isActiveParam,
        search: search.trim() ? search.trim() : undefined,
      }),
      categoryService.getCategoryStatistics().catch(() => ({
        data: { activeCategories: 0, inactiveCategories: 0 },
      })),
    ]);

    return {
      categories: response.data || [],
      statistics: statsRes.data || {
        activeCategories: 0,
        inactiveCategories: 0,
      },
      status: rawStatus,
      search,
    };
  } catch {
    return {
      categories: [],
      statistics: { activeCategories: 0, inactiveCategories: 0 },
      status: rawStatus,
      search,
    };
  }
};

export default categoriesLoader;
