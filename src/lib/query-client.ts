/**
 * TanStack Query Client Configuration (P5-001)
 *
 * Centralized query client with default options for:
 * - Stale time
 * - Cache time
 * - Retry logic
 * - Error handling
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * Default query options
 */
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      /** Data is fresh for 5 minutes */
      staleTime: 5 * 60 * 1000,
      /** Cache persists for 30 minutes */
      gcTime: 30 * 60 * 1000,
      /** Retry failed requests up to 3 times */
      retry: 3,
      /** Exponential backoff for retries */
      retryDelay: (attemptIndex: number) =>
        Math.min(1000 * 2 ** attemptIndex, 30000),
      /** Don't refetch on window focus in development */
      refetchOnWindowFocus: import.meta.env.PROD,
      /** Don't refetch on mount if data is fresh */
      refetchOnMount: false,
    },
    mutations: {
      /** Retry mutations once on failure */
      retry: 1,
    },
  },
} as const;

/**
 * Create and configure the query client
 */
export function createQueryClient(): QueryClient {
  return new QueryClient(queryClientConfig);
}

/**
 * Singleton query client instance for use throughout the app
 */
export const queryClient = createQueryClient();
