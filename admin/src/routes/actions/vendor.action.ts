import { getApiErrorMessage } from "@/api/client";
import vendorService from "@/api/services/vendor.service";
import type { VendorActionResult } from "@/types/vendor";
import type { ActionFunctionArgs } from "react-router";

export const vendorAction = async ({
  request,
}: ActionFunctionArgs): Promise<VendorActionResult> => {
  try {
    const formData = await request.formData();
    const intent =
      (formData.get("intent") as
        | "approve"
        | "reject"
        | "suspend"
        | "unsuspend"
        | "delete") || "approve";
    const vendorId = String(formData.get("vendorId") || "").trim();

    if (!vendorId) {
      return {
        success: false,
        intent,
        error: "Vendor ID is required",
      };
    }

    if (intent === "approve") {
      const response = await vendorService.updateVendorStatus(
        vendorId,
        "APPROVED",
      );
      return {
        success: true,
        intent: "approve",
        message: response.message || "Vendor request approved successfully.",
        data: response.data,
      };
    }

    if (intent === "reject" || intent === "delete") {
      const response = await vendorService.deleteVendorRequest(vendorId);
      return {
        success: true,
        intent: "delete",
        message:
          response.message || "Vendor request rejected/deleted successfully.",
        data: response.data,
      };
    }

    if (intent === "suspend") {
      const response = await vendorService.updateVendorStatus(
        vendorId,
        "SUSPENDED",
      );
      return {
        success: true,
        intent: "suspend",
        message: response.message || "Vendor shop suspended successfully.",
        data: response.data,
      };
    }

    if (intent === "unsuspend") {
      const response = await vendorService.updateVendorStatus(
        vendorId,
        "APPROVED",
      );
      return {
        success: true,
        intent: "unsuspend",
        message: response.message || "Vendor shop re-activated successfully.",
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

export default vendorAction;
