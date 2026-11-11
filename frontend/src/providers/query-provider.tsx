"use client";

import { useState, useEffect } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ApiErrorResponse } from "@/lib/api-error";

interface QueryProviderProps {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute fresh
            gcTime: 5 * 60 * 1000, // 5 minutes cache retention
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              const apiError = error as unknown as ApiErrorResponse | undefined;
              const status = apiError?.statusCode;
              // Do not retry on client errors (bad request, unauthorized, forbidden, not found)
              if (status && [400, 401, 403, 404, 409, 422].includes(status)) {
                return false;
              }
              return failureCount < 2;
            },
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  useEffect(() => {
    const handleSessionExpired = () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("justbuy_auth_active");
      }
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.removeQueries({ queryKey: ["auth", "me"] });
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
