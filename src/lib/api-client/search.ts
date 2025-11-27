/**
 * Search API Client (P5-011)
 *
 * Client for text and semantic search operations.
 */

import type { Bookmark } from "./bookmarks";
import { apiGet } from "./fetch";

/**
 * Search filters
 */
export interface SearchFilters {
  categoryId?: string;
  collectionId?: string;
  tagId?: string;
  isArchived?: boolean;
  sortBy?: "createdAt" | "updatedAt" | "title" | "relevance";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/**
 * Text search response
 */
export interface TextSearchResponse {
  data: Bookmark[];
  meta: {
    query: string;
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

/**
 * Semantic search result
 */
export interface SemanticSearchResult {
  id: string;
  title: string;
  url: string;
  description?: string;
  categoryName?: string;
  tags: string[];
  relevanceScore: number;
  matchReason?: string;
}

/**
 * Semantic search response
 */
export interface SemanticSearchResponse {
  data: {
    results: SemanticSearchResult[];
    query: string;
    interpretation?: string;
    total: number;
    tokensUsed: number;
  };
}

/**
 * Search suggestions response
 */
export interface SearchSuggestionsResponse {
  data: {
    bookmarks: Array<{ id: string; title: string; url: string }>;
    tags: Array<{ id: string; name: string }>;
    categories: Array<{ id: string; name: string }>;
  };
}

/**
 * Search API client
 */
export const searchApi = {
  /**
   * Text search across bookmarks
   */
  text(query: string, filters?: SearchFilters): Promise<TextSearchResponse> {
    return apiGet<TextSearchResponse>("/search", {
      q: query,
      ...filters,
    } as Record<string, string | number | boolean | undefined>);
  },

  /**
   * AI-powered semantic search
   */
  semantic(query: string, limit = 20): Promise<SemanticSearchResponse> {
    return apiGet<SemanticSearchResponse>("/search/semantic", {
      q: query,
      limit,
    });
  },

  /**
   * Get search suggestions for autocomplete
   */
  suggestions(query: string): Promise<SearchSuggestionsResponse> {
    return apiGet<SearchSuggestionsResponse>("/search/suggestions", {
      q: query,
    });
  },
};
