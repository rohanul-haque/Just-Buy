<<<<<<< HEAD
/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

import axios from "axios";

interface ApiErrorResponse {
  message?: unknown;
  error?: unknown;
  errors?: unknown;
}

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data;

    if (data) {
      // Backend validation errors
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        const first = data.errors[0];

        if (typeof first === "string" && first.trim()) {
          return first;
        }

        if (
          typeof first === "object" &&
          first !== null &&
          "message" in first &&
          typeof first.message === "string" &&
          first.message.trim()
        ) {
          return first.message;
        }
      }

      // Backend message
      if (
        typeof data.message === "string" &&
        data.message.trim()
      ) {
        return data.message;
      }

      // Alternative error property
      if (
        typeof data.error === "string" &&
        data.error.trim()
      ) {
        return data.error;
      }
    }

    // Network or Axios error
    if (!error.response) {
      return "Unable to connect to the server. Please check your internet connection.";
    }

    return error.message || "Something went wrong. Please try again.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
};
=======
import { isAxiosError } from "axios";

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  errors?: ApiFieldError[];
}

export interface ApiPagination {
  page?: number;
  skip?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: ApiPagination;
}

/**
 * Normalizes backend error envelopes into a consistent ApiErrorResponse object
 */
export function normalizeApiError(error: unknown): ApiErrorResponse {
  if (isAxiosError(error)) {
    const status = error.response?.status || 500;
    const data = error.response?.data as Record<string, unknown> | undefined;

    if (data && typeof data === "object") {
      const code = typeof data.code === "string" ? data.code : "API_ERROR";
      const message =
        typeof data.message === "string"
          ? data.message
          : error.message || "An unexpected server error occurred.";
      const rawErrors = Array.isArray(data.errors) ? data.errors : undefined;

      const errors: ApiFieldError[] | undefined = rawErrors?.map((err: unknown) => {
        if (typeof err === "object" && err !== null) {
          const item = err as Record<string, unknown>;
          return {
            field: typeof item.field === "string" ? item.field : "general",
            message: typeof item.message === "string" ? item.message : "Invalid value",
          };
        }
        return {
          field: "general",
          message: String(err),
        };
      });

      return {
        statusCode: status,
        code,
        message,
        errors,
      };
    }

    return {
      statusCode: status,
      code: error.code || "NETWORK_ERROR",
      message:
        status === 404
          ? "Resource not found"
          : status === 500
          ? "Internal server error"
          : error.message || "Network error. Please verify your connection.",
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      code: "CLIENT_ERROR",
      message: error.message,
    };
  }

  return {
    statusCode: 500,
    code: "UNKNOWN_ERROR",
    message: "An unknown error occurred.",
  };
}

/**
 * Extracts a field-specific error message from an ApiErrorResponse
 */
export function getFieldError(
  error: ApiErrorResponse | null | undefined,
  fieldName: string,
): string | undefined {
  if (!error?.errors || error.errors.length === 0) return undefined;
  const match = error.errors.find((err) => err.field === fieldName);
  return match?.message;
}

>>>>>>> origin/develop
