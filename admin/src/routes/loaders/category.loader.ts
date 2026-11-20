import { categoriesQueryOptions } from "@/api/queries/category.queries";
import { queryClient } from "@/lib/queryClient";
import type { LoaderFunction } from "react-router";

export const categoriesLoader: LoaderFunction = async () => {
  return await queryClient.ensureQueryData(categoriesQueryOptions());
};

export default categoriesLoader;
