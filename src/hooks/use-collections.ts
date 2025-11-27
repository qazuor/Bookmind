/**
 * useCollections Hook (P5-017)
 *
 * TanStack Query hook for collection operations including sharing.
 */

import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  type Collection,
  type CollectionListResponse,
  type CollectionTreeResponse,
  type CreateCollectionInput,
  collectionsApi,
  type SharedCollectionResponse,
  type UpdateCollectionInput,
} from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

/**
 * Hook for fetching collections list (flat)
 */
export function useCollections(
  options?: Omit<
    UseQueryOptions<CollectionListResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.collections.list(),
    queryFn: () => collectionsApi.list(),
    ...options,
  });
}

/**
 * Hook for fetching collections tree (nested)
 */
export function useCollectionTree(
  options?: Omit<
    UseQueryOptions<CollectionTreeResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.collections.tree(),
    queryFn: () => collectionsApi.tree(),
    ...options,
  });
}

/**
 * Hook for fetching a single collection
 */
export function useCollection(
  id: string,
  options?: Omit<
    UseQueryOptions<{ data: Collection }, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.collections.detail(id),
    queryFn: () => collectionsApi.get(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook for fetching shared collection by token (public)
 */
export function useSharedCollection(
  token: string,
  options?: Omit<
    UseQueryOptions<SharedCollectionResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.collections.shared(token),
    queryFn: () => collectionsApi.getShared(token),
    enabled: !!token,
    ...options,
  });
}

/**
 * Hook for creating a collection
 */
export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCollectionInput) => collectionsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
  });
}

/**
 * Hook for updating a collection
 */
export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCollectionInput }) =>
      collectionsApi.update(id, input),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        queryKeys.collections.detail(variables.id),
        data,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.tree() });
    },
  });
}

/**
 * Hook for deleting a collection
 */
export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => collectionsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: queryKeys.collections.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
  });
}

/**
 * Hook for sharing a collection
 */
export function useShareCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => collectionsApi.share(id),
    onSuccess: (data, id) => {
      // Update collection with share token
      const collection = queryClient.getQueryData<{ data: Collection }>(
        queryKeys.collections.detail(id),
      );
      if (collection) {
        queryClient.setQueryData(queryKeys.collections.detail(id), {
          data: {
            ...collection.data,
            shareToken: data.data.shareToken,
            isShared: true,
          },
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.list() });
    },
  });
}

/**
 * Hook for unsharing a collection
 */
export function useUnshareCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => collectionsApi.unshare(id),
    onSuccess: (_, id) => {
      // Update collection to remove share token
      const collection = queryClient.getQueryData<{ data: Collection }>(
        queryKeys.collections.detail(id),
      );
      if (collection) {
        queryClient.setQueryData(queryKeys.collections.detail(id), {
          data: {
            ...collection.data,
            shareToken: undefined,
            isShared: false,
          },
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.list() });
    },
  });
}
