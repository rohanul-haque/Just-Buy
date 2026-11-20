import type { LoaderFunction } from "react-router";
import { queryClient } from "@/lib/queryClient";
import { categoriesQueryOptions } from "@/api/queries/category.queries";

export const categoriesLoader: LoaderFunction = async () => {
  return await queryClient.ensureQueryData(categoriesQueryOptions());
};

export default categoriesLoader;
