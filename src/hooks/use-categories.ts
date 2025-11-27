/**
 * useCategories Hook (P5-016)
 *
 * TanStack Query hook for category operations.
 */

import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  type Category,
  type CategoryListResponse,
  type CreateCategoryInput,
  categoriesApi,
  type UpdateCategoryInput,
} from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

/**
 * Hook for fetching categories list
 */
export function useCategories(
  options?: Omit<
    UseQueryOptions<CategoryListResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => categoriesApi.list(),
    ...options,
  });
}

/**
 * Hook for fetching a single category
 */
export function useCategory(
  id: string,
  options?: Omit<
    UseQueryOptions<{ data: Category }, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => categoriesApi.get(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook for creating a category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => categoriesApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
  });
}

/**
 * Hook for updating a category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      categoriesApi.update(id, input),
    onSuccess: (data, variables) => {
      // Update specific category in cache
      queryClient.setQueryData(queryKeys.categories.detail(variables.id), data);
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.list() });
    },
  });
}

/**
 * Hook for deleting a category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: queryKeys.categories.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.list() });
      // Bookmarks may have been affected
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
  });
}
