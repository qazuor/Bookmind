/**
 * useBookmarks Hook (P5-014)
 *
 * TanStack Query hook for bookmark list operations with optimistic updates.
 */

import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  type Bookmark,
  type BookmarkListResponse,
  type BulkOperationInput,
  bookmarksApi,
  type CreateBookmarkInput,
  type UpdateBookmarkInput,
} from "@/lib/api-client";
import { type BookmarkFilters, queryKeys } from "@/lib/query-keys";

/**
 * Hook for fetching bookmarks list
 */
export function useBookmarks(
  filters?: BookmarkFilters,
  options?: Omit<
    UseQueryOptions<BookmarkListResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.bookmarks.list(filters),
    queryFn: () => bookmarksApi.list(filters),
    ...options,
  });
}

/**
 * Hook for fetching archived bookmarks
 */
export function useArchivedBookmarks(
  options?: Omit<
    UseQueryOptions<BookmarkListResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.bookmarks.archived(),
    queryFn: () => bookmarksApi.list({ isArchived: true }),
    ...options,
  });
}

/**
 * Hook for fetching favorite bookmarks
 */
export function useFavoriteBookmarks(
  options?: Omit<
    UseQueryOptions<BookmarkListResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.bookmarks.favorites(),
    queryFn: () => bookmarksApi.list({ isFavorite: true }),
    ...options,
  });
}

/**
 * Hook for creating a bookmark
 */
export function useCreateBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBookmarkInput) => bookmarksApi.create(input),
    onSuccess: () => {
      // Invalidate all bookmark lists
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
  });
}

/**
 * Hook for updating a bookmark
 */
export function useUpdateBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBookmarkInput }) =>
      bookmarksApi.update(id, input),
    onSuccess: (data, variables) => {
      // Update the specific bookmark in cache
      queryClient.setQueryData(queryKeys.bookmarks.detail(variables.id), data);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.lists() });
    },
  });
}

/**
 * Hook for deleting a bookmark
 */
export function useDeleteBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookmarksApi.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: queryKeys.bookmarks.detail(id),
      });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
  });
}

/**
 * Hook for archiving a bookmark
 */
export function useArchiveBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookmarksApi.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all });
    },
  });
}

/**
 * Hook for unarchiving a bookmark
 */
export function useUnarchiveBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookmarksApi.unarchive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all });
    },
  });
}

/**
 * Hook for toggling favorite status
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      bookmarksApi.toggleFavorite(id, isFavorite),
    // Optimistic update
    onMutate: async ({ id, isFavorite }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.bookmarks.detail(id),
      });

      // Snapshot previous value
      const previousBookmark = queryClient.getQueryData<{ data: Bookmark }>(
        queryKeys.bookmarks.detail(id),
      );

      // Optimistically update
      if (previousBookmark) {
        queryClient.setQueryData(queryKeys.bookmarks.detail(id), {
          data: { ...previousBookmark.data, isFavorite },
        });
      }

      return { previousBookmark };
    },
    onError: (_, variables, context) => {
      // Rollback on error
      if (context?.previousBookmark) {
        queryClient.setQueryData(
          queryKeys.bookmarks.detail(variables.id),
          context.previousBookmark,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.lists() });
    },
  });
}

/**
 * Hook for bulk operations
 */
export function useBulkBookmarkOperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BulkOperationInput) => bookmarksApi.bulk(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
  });
}

/**
 * Hook for regenerating AI summary
 */
export function useRegenerateSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookmarksApi.regenerateSummary(id),
    onSuccess: (data, id) => {
      // Update bookmark with new summary
      const bookmark = queryClient.getQueryData<{ data: Bookmark }>(
        queryKeys.bookmarks.detail(id),
      );
      if (bookmark) {
        queryClient.setQueryData(queryKeys.bookmarks.detail(id), {
          data: { ...bookmark.data, aiSummary: data.data.summary },
        });
      }
    },
  });
}

/**
 * Hook for getting AI suggestions
 */
export function useAISuggestions(id: string, enabled = false) {
  return useQuery({
    queryKey: queryKeys.bookmarks.aiSuggestions(id),
    queryFn: () => bookmarksApi.getAISuggestions(id),
    enabled,
    staleTime: Infinity, // Don't auto-refresh suggestions
  });
}
