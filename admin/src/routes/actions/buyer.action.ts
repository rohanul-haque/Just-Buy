import { getApiErrorMessage } from "@/api/client";
import buyerService from "@/api/services/buyer.service";
import type { BuyerActionResult } from "@/types/buyer";
import type { ActionFunctionArgs } from "react-router";

export const buyerAction = async ({
  request,
}: ActionFunctionArgs): Promise<BuyerActionResult> => {
  try {
    const formData = await request.formData();
    const intent = (formData.get("intent") as "block" | "unblock" | "delete") || "block";
    const buyerId = String(formData.get("buyerId") || "").trim();

    if (!buyerId) {
      return {
        success: false,
        intent,
        error: "Buyer ID is required",
      };
    }

    if (intent === "block") {
      const response = await buyerService.updateBuyerStatus(buyerId, "BLOCKED");
      return {
        success: true,
        intent: "block",
        message: response.message || "Buyer account blocked successfully.",
        data: response.data,
      };
    }

    if (intent === "unblock") {
      const response = await buyerService.updateBuyerStatus(buyerId, "ACTIVE");
      return {
        success: true,
        intent: "unblock",
        message: response.message || "Buyer account activated successfully.",
        data: response.data,
      };
    }

    if (intent === "delete") {
      const response = await buyerService.deleteBuyer(buyerId);
      return {
        success: true,
        intent: "delete",
        message:
          response.message ||
          "Buyer account soft-deleted successfully (data preserved).",
        data: response.data,
      };
    }

    return {
      success: false,
      intent,
      error: `Unsupported action intent: ${intent}`,
    };
  } catch (error) {
    return {
      success: false,
      error: getApiErrorMessage(error),
    };
  }
};

export default buyerAction;
