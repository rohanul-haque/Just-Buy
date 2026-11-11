import { toast } from "sonner";
import type { ApiErrorResponse } from "@/lib/api-error";

// Cache recently displayed toast keys to prevent immediate duplicates
const recentToasts = new Set<string>();
const DEDUPLICATION_INTERVAL_MS = 2000;

function shouldShowToast(key: string): boolean {
  if (recentToasts.has(key)) {
    return false;
  }
  recentToasts.add(key);
  setTimeout(() => {
    recentToasts.delete(key);
  }, DEDUPLICATION_INTERVAL_MS);
  return true;
}

export const notify = {
  /**
   * Display a success toast
   */
  success(message: string, description?: string) {
    const key = `success:${message}:${description || ""}`;
    if (!shouldShowToast(key)) return;
    toast.success(message, { description });
  },

  /**
   * Display an error toast
   */
  error(message: string, description?: string) {
    const key = `error:${message}:${description || ""}`;
    if (!shouldShowToast(key)) return;
    toast.error(message, { description });
  },

  /**
   * Display an info toast
   */
  info(message: string, description?: string) {
    const key = `info:${message}:${description || ""}`;
    if (!shouldShowToast(key)) return;
    toast.info(message, { description });
  },

  /**
   * Display a warning toast
   */
  warning(message: string, description?: string) {
    const key = `warning:${message}:${description || ""}`;
    if (!shouldShowToast(key)) return;
    toast.warning(message, { description });
  },

  /**
   * Helper to display an API error using the normalized error response
   */
  apiError(error: unknown, fallbackMessage = "An unexpected error occurred.") {
    const err = error as ApiErrorResponse;
    const message = err?.message || fallbackMessage;
    // If field errors exist and are multiple, extract first or concise summary
    let description: string | undefined;
    if (err?.errors && err.errors.length > 0) {
      description = err.errors.map((e) => e.message).join(", ");
    }
    this.error(message, description);
  },

  /**
   * Dismiss all or specific toast
   */
  dismiss(toastId?: string | number) {
    toast.dismiss(toastId);
  },
};

export default notify;

