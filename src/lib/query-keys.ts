/**
 * Query Keys Factory (P5-002)
 *
 * Centralized query key management for TanStack Query.
 * Uses a factory pattern to generate consistent, type-safe query keys.
 *
 * Pattern: [entity, scope?, id?, filters?]
 */

import type { BookmarkFilters } from "./api-client/bookmarks";
import type { SearchFilters } from "./api-client/search";

export type { BookmarkFilters, SearchFilters };

/**
 * Query keys for all entities
 */
export const queryKeys = {
  /**
   * Bookmark queries
   */
  bookmarks: {
    /** All bookmark queries */
    all: ["bookmarks"] as const,
    /** Bookmark lists with optional filters */
    lists: () => [...queryKeys.bookmarks.all, "list"] as const,
    /** Filtered bookmark list */
    list: (filters?: BookmarkFilters) =>
      [...queryKeys.bookmarks.lists(), filters ?? {}] as const,
    /** Single bookmark detail queries */
    details: () => [...queryKeys.bookmarks.all, "detail"] as const,
    /** Single bookmark by ID */
    detail: (id: string) => [...queryKeys.bookmarks.details(), id] as const,
    /** Archived bookmarks */
    archived: () => [...queryKeys.bookmarks.all, "archived"] as const,
    /** Favorite bookmarks */
    favorites: () => [...queryKeys.bookmarks.all, "favorites"] as const,
    /** AI suggestions for a bookmark */
    aiSuggestions: (id: string) =>
      [...queryKeys.bookmarks.detail(id), "ai-suggestions"] as const,
  },

  /**
   * Category queries
   */
  categories: {
    /** All category queries */
    all: ["categories"] as const,
    /** Category list */
    list: () => [...queryKeys.categories.all, "list"] as const,
    /** Single category by ID */
    detail: (id: string) =>
      [...queryKeys.categories.all, "detail", id] as const,
    /** Category with bookmark count */
    withCounts: () => [...queryKeys.categories.all, "with-counts"] as const,
  },

  /**
   * Collection queries
   */
  collections: {
    /** All collection queries */
    all: ["collections"] as const,
    /** Collection list (flat) */
    list: () => [...queryKeys.collections.all, "list"] as const,
    /** Collection tree (nested) */
    tree: () => [...queryKeys.collections.all, "tree"] as const,
    /** Single collection by ID */
    detail: (id: string) =>
      [...queryKeys.collections.all, "detail", id] as const,
    /** Bookmarks in a collection */
    bookmarks: (id: string) =>
      [...queryKeys.collections.detail(id), "bookmarks"] as const,
    /** Shared collection by token */
    shared: (token: string) =>
      [...queryKeys.collections.all, "shared", token] as const,
  },

  /**
   * Tag queries
   */
  tags: {
    /** All tag queries */
    all: ["tags"] as const,
    /** Tag list */
    list: () => [...queryKeys.tags.all, "list"] as const,
    /** Single tag by ID */
    detail: (id: string) => [...queryKeys.tags.all, "detail", id] as const,
    /** Tags with bookmark counts */
    withCounts: () => [...queryKeys.tags.all, "with-counts"] as const,
    /** Popular tags (for tag cloud) */
    popular: (limit?: number) =>
      [...queryKeys.tags.all, "popular", limit ?? 20] as const,
  },

  /**
   * Search queries
   */
  search: {
    /** All search queries */
    all: ["search"] as const,
    /** Text search */
    text: (query: string, filters?: SearchFilters) =>
      [...queryKeys.search.all, "text", query, filters ?? {}] as const,
    /** Semantic/AI search */
    semantic: (query: string) =>
      [...queryKeys.search.all, "semantic", query] as const,
    /** Search suggestions/autocomplete */
    suggestions: (query: string) =>
      [...queryKeys.search.all, "suggestions", query] as const,
  },

  /**
   * User queries
   */
  user: {
    /** All user queries */
    all: ["user"] as const,
    /** Current user profile */
    profile: () => [...queryKeys.user.all, "profile"] as const,
    /** User preferences */
    preferences: () => [...queryKeys.user.all, "preferences"] as const,
    /** Public profile by username */
    public: (username: string) =>
      [...queryKeys.user.all, "public", username] as const,
  },

  /**
   * Stats queries
   */
  stats: {
    /** All stats queries */
    all: ["stats"] as const,
    /** Dashboard overview stats */
    overview: () => [...queryKeys.stats.all, "overview"] as const,
    /** Activity timeline */
    activity: (days?: number) =>
      [...queryKeys.stats.all, "activity", days ?? 30] as const,
    /** Category distribution */
    byCategory: () => [...queryKeys.stats.all, "by-category"] as const,
    /** Tag distribution */
    byTag: () => [...queryKeys.stats.all, "by-tag"] as const,
  },

  /**
   * Export queries
   */
  export: {
    /** All export queries */
    all: ["export"] as const,
    /** Export preview */
    preview: (format: "html" | "json" | "csv") =>
      [...queryKeys.export.all, "preview", format] as const,
  },
} as const;

/**
 * Type helper for query key inference
 */
export type QueryKeys = typeof queryKeys;
