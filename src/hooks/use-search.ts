/**
 * useSearch Hook (P5-019)
 *
 * TanStack Query hook for search operations with debouncing.
 */

import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  type SearchFilters,
  type SearchSuggestionsResponse,
  type SemanticSearchResponse,
  searchApi,
  type TextSearchResponse,
} from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { useSearchStore } from "@/stores";
import { useDebouncedValue } from "./use-debounced-value";

/**
 * Hook for text search
 */
export function useTextSearch(
  query: string,
  filters?: SearchFilters,
  options?: Omit<
    UseQueryOptions<TextSearchResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const debouncedQuery = useDebouncedValue(query, 300);

  return useQuery({
    queryKey: queryKeys.search.text(debouncedQuery, filters),
    queryFn: () => searchApi.text(debouncedQuery, filters),
    enabled: debouncedQuery.length >= 2,
    ...options,
  });
}

/**
 * Hook for semantic/AI search
 */
export function useSemanticSearch(
  query: string,
  limit = 20,
  options?: Omit<
    UseQueryOptions<SemanticSearchResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const debouncedQuery = useDebouncedValue(query, 500);

  return useQuery({
    queryKey: queryKeys.search.semantic(debouncedQuery),
    queryFn: () => searchApi.semantic(debouncedQuery, limit),
    enabled: debouncedQuery.length >= 2,
    staleTime: 60 * 1000, // AI results are expensive, cache longer
    ...options,
  });
}

/**
 * Hook for search suggestions/autocomplete
 */
export function useSearchSuggestions(
  query: string,
  options?: Omit<
    UseQueryOptions<SearchSuggestionsResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const debouncedQuery = useDebouncedValue(query, 200);

  return useQuery({
    queryKey: queryKeys.search.suggestions(debouncedQuery),
    queryFn: () => searchApi.suggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 1,
    ...options,
  });
}

/**
 * Combined search hook that uses store state
 */
export function useSearch() {
  const query = useSearchStore((state) => state.query);
  const mode = useSearchStore((state) => state.mode);
  const filters = useSearchStore((state) => state.filters);
  const sortBy = useSearchStore((state) => state.sortBy);
  const sortOrder = useSearchStore((state) => state.sortOrder);
  const setQuery = useSearchStore((state) => state.setQuery);
  const setMode = useSearchStore((state) => state.setMode);
  const clearFilters = useSearchStore((state) => state.clearFilters);

  // Build search filters
  // Map sortBy to search API compatible values (visitCount not supported in search, use createdAt)
  const searchFilters = useMemo<SearchFilters>(() => {
    const validSortBy =
      sortBy === "visitCount"
        ? "createdAt"
        : (sortBy as SearchFilters["sortBy"]);
    return {
      ...filters,
      sortBy: validSortBy,
      sortOrder,
    };
  }, [filters, sortBy, sortOrder]);

  // Text search query
  const textSearch = useTextSearch(query, searchFilters, {
    enabled: mode === "text" && query.length >= 2,
  });

  // Semantic search query
  const semanticSearch = useSemanticSearch(query, 20, {
    enabled: mode === "semantic" && query.length >= 2,
  });

  // Get the active search result based on mode
  const activeSearch = mode === "semantic" ? semanticSearch : textSearch;

  return {
    // State
    query,
    mode,
    filters,
    sortBy,
    sortOrder,

    // Actions
    setQuery,
    setMode,
    clearFilters,

    // Query results
    textSearch,
    semanticSearch,
    activeSearch,

    // Derived state
    isSearching: query.length >= 2,
    isLoading: activeSearch.isLoading,
    isError: activeSearch.isError,
    error: activeSearch.error,
  };
}
