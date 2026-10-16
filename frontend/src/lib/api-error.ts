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
