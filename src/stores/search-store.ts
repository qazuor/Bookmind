/**
 * Search Store (P5-004)
 *
 * Search state management with Zustand.
 * Handles search query, filters, sort options, and search mode.
 */

import { create } from "zustand";

/**
 * Sort options for bookmarks
 */
export type SortBy = "createdAt" | "updatedAt" | "title" | "visitCount";
export type SortOrder = "asc" | "desc";

/**
 * Search mode
 */
export type SearchMode = "text" | "semantic";

/**
 * Search filters
 */
export interface SearchFilters {
  categoryId?: string;
  collectionId?: string;
  tagIds?: string[];
  isArchived?: boolean;
  isPublic?: boolean;
  isFavorite?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Search store state
 */
interface SearchState {
  /** Current search query */
  query: string;
  /** Search mode (text or semantic/AI) */
  mode: SearchMode;
  /** Active filters */
  filters: SearchFilters;
  /** Sort field */
  sortBy: SortBy;
  /** Sort direction */
  sortOrder: SortOrder;
  /** Whether filters panel is open */
  filtersOpen: boolean;
}

/**
 * Search store actions
 */
interface SearchActions {
  /** Set search query */
  setQuery: (query: string) => void;
  /** Set search mode */
  setMode: (mode: SearchMode) => void;
  /** Set a single filter */
  setFilter: <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K],
  ) => void;
  /** Set multiple filters at once */
  setFilters: (filters: Partial<SearchFilters>) => void;
  /** Clear all filters */
  clearFilters: () => void;
  /** Set sort options */
  setSort: (sortBy: SortBy, sortOrder?: SortOrder) => void;
  /** Toggle sort order */
  toggleSortOrder: () => void;
  /** Toggle filters panel */
  toggleFiltersOpen: () => void;
  /** Reset all search state */
  reset: () => void;
}

/**
 * Combined search store type
 */
type SearchStore = SearchState & SearchActions;

/**
 * Default search state
 */
const defaultState: SearchState = {
  query: "",
  mode: "text",
  filters: {},
  sortBy: "createdAt",
  sortOrder: "desc",
  filtersOpen: false,
};

/**
 * Search store (not persisted - resets on page load)
 */
export const useSearchStore = create<SearchStore>((set) => ({
  ...defaultState,

  setQuery: (query) => set({ query }),

  setMode: (mode) => set({ mode }),

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  clearFilters: () => set({ filters: {} }),

  setSort: (sortBy, sortOrder) =>
    set((state) => ({
      sortBy,
      sortOrder: sortOrder ?? state.sortOrder,
    })),

  toggleSortOrder: () =>
    set((state) => ({
      sortOrder: state.sortOrder === "asc" ? "desc" : "asc",
    })),

  toggleFiltersOpen: () =>
    set((state) => ({ filtersOpen: !state.filtersOpen })),

  reset: () => set(defaultState),
}));

/**
 * Selector hooks for specific search state
 */
export const useSearchQuery = () => useSearchStore((state) => state.query);
export const useSearchMode = () => useSearchStore((state) => state.mode);
export const useSearchFilters = () => useSearchStore((state) => state.filters);
export const useSearchSort = () =>
  useSearchStore((state) => ({
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
  }));

/**
 * Check if any filters are active
 */
export const useHasActiveFilters = () =>
  useSearchStore((state) => {
    const { filters } = state;
    return (
      !!filters.categoryId ||
      !!filters.collectionId ||
      (filters.tagIds && filters.tagIds.length > 0) ||
      filters.isArchived !== undefined ||
      filters.isPublic !== undefined ||
      filters.isFavorite !== undefined ||
      !!filters.dateFrom ||
      !!filters.dateTo
    );
  });

/**
 * Get filter count for badge display
 */
export const useActiveFilterCount = () =>
  useSearchStore((state) => {
    const { filters } = state;
    let count = 0;
    if (filters.categoryId) count++;
    if (filters.collectionId) count++;
    if (filters.tagIds?.length) count++;
    if (filters.isArchived !== undefined) count++;
    if (filters.isPublic !== undefined) count++;
    if (filters.isFavorite !== undefined) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  });
