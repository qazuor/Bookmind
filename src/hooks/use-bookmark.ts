/**
 * useBookmark Hook (P5-015)
 *
 * TanStack Query hook for single bookmark operations.
 */

import {
  type UseQueryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { type Bookmark, bookmarksApi } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

/**
 * Hook for fetching a single bookmark
 */
export function useBookmark(
  id: string,
  options?: Omit<
    UseQueryOptions<{ data: Bookmark }, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.bookmarks.detail(id),
    queryFn: () => bookmarksApi.get(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook for prefetching a bookmark (for hover states)
 */
export function usePrefetchBookmark() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.bookmarks.detail(id),
      queryFn: () => bookmarksApi.get(id),
      staleTime: 60 * 1000, // 1 minute
    });
  };
}
