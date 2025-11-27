/**
 * Bookmarks API Client (P5-007)
 *
 * Client for bookmark CRUD operations and related actions.
 */

import { apiDelete, apiGet, apiPatch, apiPost } from "./fetch";

/**
 * Bookmark data from API
 */
export interface Bookmark {
  id: string;
  userId: string;
  url: string;
  title: string;
  description?: string;
  favicon?: string;
  ogImage?: string;
  aiSummary?: string;
  notes?: string;
  categoryId?: string;
  isPublic: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  visitCount: number;
  lastVisitedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  category?: { id: string; name: string; color?: string };
  tags?: Array<{ id: string; name: string; color?: string }>;
  collections?: Array<{ id: string; name: string }>;
}

/**
 * Create bookmark input
 */
export interface CreateBookmarkInput {
  url: string;
  title?: string;
  description?: string;
  notes?: string;
  categoryId?: string;
  isPublic?: boolean;
  isFavorite?: boolean;
  tagIds?: string[];
  collectionIds?: string[];
}

/**
 * Update bookmark input
 */
export interface UpdateBookmarkInput {
  url?: string;
  title?: string;
  description?: string;
  notes?: string;
  categoryId?: string | null;
  isPublic?: boolean;
  isFavorite?: boolean;
  tagIds?: string[];
  collectionIds?: string[];
}

/**
 * Bookmark filters
 */
export interface BookmarkFilters {
  categoryId?: string;
  collectionId?: string;
  tagId?: string;
  isArchived?: boolean;
  isPublic?: boolean;
  isFavorite?: boolean;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "title" | "visitCount";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/**
 * Paginated bookmark response
 */
export interface BookmarkListResponse {
  data: Bookmark[];
  meta: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * AI suggestions response
 */
export interface AISuggestionsResponse {
  data: {
    bookmarkId: string;
    suggestions: {
      tags?: string[];
      category?: { name: string; confidence: number };
    };
    tokensUsed: number;
  };
}

/**
 * Bulk operation input
 */
export interface BulkOperationInput {
  ids: string[];
  operation: "delete" | "archive" | "unarchive" | "move";
  categoryId?: string;
  collectionId?: string;
}

/**
 * Bookmarks API client
 */
export const bookmarksApi = {
  /**
   * List bookmarks with filters
   */
  list(filters?: BookmarkFilters): Promise<BookmarkListResponse> {
    return apiGet<BookmarkListResponse>(
      "/bookmarks",
      filters as Record<string, string | number | boolean | undefined>,
    );
  },

  /**
   * Get single bookmark by ID
   */
  get(id: string): Promise<{ data: Bookmark }> {
    return apiGet<{ data: Bookmark }>(`/bookmarks/${id}`);
  },

  /**
   * Create new bookmark
   */
  create(input: CreateBookmarkInput): Promise<{ data: Bookmark }> {
    return apiPost<{ data: Bookmark }>("/bookmarks", input);
  },

  /**
   * Update bookmark
   */
  update(id: string, input: UpdateBookmarkInput): Promise<{ data: Bookmark }> {
    return apiPatch<{ data: Bookmark }>(`/bookmarks/${id}`, input);
  },

  /**
   * Delete bookmark
   */
  delete(id: string): Promise<void> {
    return apiDelete(`/bookmarks/${id}`);
  },

  /**
   * Archive bookmark
   */
  archive(id: string): Promise<{ data: Bookmark }> {
    return apiPost<{ data: Bookmark }>(`/bookmarks/${id}/archive`);
  },

  /**
   * Unarchive bookmark
   */
  unarchive(id: string): Promise<{ data: Bookmark }> {
    return apiDelete<{ data: Bookmark }>(`/bookmarks/${id}/archive`);
  },

  /**
   * Toggle favorite status
   */
  toggleFavorite(id: string, isFavorite: boolean): Promise<{ data: Bookmark }> {
    return apiPatch<{ data: Bookmark }>(`/bookmarks/${id}`, { isFavorite });
  },

  /**
   * Bulk operations
   */
  bulk(input: BulkOperationInput): Promise<{ data: { affected: number } }> {
    return apiPost<{ data: { affected: number } }>("/bookmarks/bulk", input);
  },

  /**
   * Regenerate AI summary
   */
  regenerateSummary(
    id: string,
  ): Promise<{ data: { summary: string; tokensUsed: number } }> {
    return apiPost<{ data: { summary: string; tokensUsed: number } }>(
      `/bookmarks/${id}/ai/summary`,
    );
  },

  /**
   * Get AI suggestions (tags, category)
   */
  getAISuggestions(id: string): Promise<AISuggestionsResponse> {
    return apiPost<AISuggestionsResponse>(`/bookmarks/${id}/ai/suggestions`);
  },
};
