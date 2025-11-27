/**
 * useTags Hook (P5-018)
 *
 * TanStack Query hook for tag operations.
 */

import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  type CreateTagInput,
  type Tag,
  type TagListResponse,
  tagsApi,
  type UpdateTagInput,
} from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

/**
 * Hook for fetching tags list
 */
export function useTags(
  options?: Omit<
    UseQueryOptions<TagListResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.tags.list(),
    queryFn: () => tagsApi.list(),
    ...options,
  });
}

/**
 * Hook for fetching popular tags
 */
export function usePopularTags(
  limit = 20,
  options?: Omit<
    UseQueryOptions<TagListResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.tags.popular(limit),
    queryFn: () => tagsApi.popular(limit),
    ...options,
  });
}

/**
 * Hook for fetching a single tag
 */
export function useTag(
  id: string,
  options?: Omit<UseQueryOptions<{ data: Tag }, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: queryKeys.tags.detail(id),
    queryFn: () => tagsApi.get(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook for creating a tag
 */
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTagInput) => tagsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
  });
}

/**
 * Hook for updating a tag
 */
export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTagInput }) =>
      tagsApi.update(id, input),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.tags.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.list() });
    },
  });
}

/**
 * Hook for deleting a tag
 */
export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tagsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.tags.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.list() });
      // Bookmarks may have been affected
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
  });
}
