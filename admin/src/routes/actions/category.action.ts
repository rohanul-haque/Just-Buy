import { getApiErrorMessage } from "@/api/client";
import categoryService from "@/api/services/category.service";
import type { ICategory } from "@/types/category";
import type { ActionFunction } from "react-router";

export type CategoryActionIntent =
  | "create"
  | "update"
  | "updateStatus"
  | "delete";

export interface CategoryActionResult {
  intent: CategoryActionIntent;
  success: boolean;
  message?: string;
  error?: string;
  data?: ICategory | { message: string };
}

export const categoryAction: ActionFunction = async ({
  request,
}): Promise<CategoryActionResult> => {
  const formData = await request.formData();
  const intent = (formData.get("intent") as CategoryActionIntent) || "create";

  try {
    switch (intent) {
      case "create": {
        formData.delete("intent");
        const res = await categoryService.createCategory(formData);
        return {
          intent,
          success: true,
          message: "Category created successfully!",
          data: res.data,
        };
      }

      case "update": {
        const categoryId = formData.get("categoryId") as string;
        formData.delete("intent");
        formData.delete("categoryId");
        const res = await categoryService.updateCategory(categoryId, formData);
        return {
          intent,
          success: true,
          message: "Category updated successfully!",
          data: res.data,
        };
      }

      case "updateStatus": {
        const categoryId = formData.get("categoryId") as string;
        const isActive = formData.get("isActive") === "true";
        const res = await categoryService.updateCategoryStatus(
          categoryId,
          isActive,
        );
        return {
          intent,
          success: true,
          message: `Category "${res.data?.name || ""}" is now ${isActive ? "Active" : "Inactive"}!`,
          data: res.data,
        };
      }

      case "delete": {
        const categoryId = formData.get("categoryId") as string;
        const res = await categoryService.deleteCategory(categoryId);
        return {
          intent,
          success: true,
          message: res.data?.message || "Category deleted successfully!",
          data: res.data,
        };
      }

      default:
        return {
          intent,
          success: false,
          error: "Unrecognized category action intent.",
        };
    }
  } catch (error) {
    return {
      intent,
      success: false,
      error: getApiErrorMessage(error),
    };
  }
};

export default categoryAction;
