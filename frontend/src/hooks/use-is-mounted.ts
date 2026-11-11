"use client";

import * as React from "react";

const emptySubscribe = () => () => {};

/**
 * Hook to detect if component has mounted on the client,
 * avoiding hydration mismatch and cascading effect renders in React 19.
 */
export function useIsMounted(): boolean {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

