import categoryService from "@/api/services/category.service";
import type { ICategory, ICategoryQuery } from "@/types/category";
import { queryOptions } from "@tanstack/react-query";

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (query?: ICategoryQuery) => [...categoryKeys.lists(), query] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

export const categoriesQueryOptions = (query?: ICategoryQuery) =>
  queryOptions<ICategory[]>({
    queryKey: categoryKeys.list(query),
    queryFn: async () => {
      const response = await categoryService.getAllCategories(query);
      return response.data || [];
    },
  });
