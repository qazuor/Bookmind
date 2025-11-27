/**
 * Tags API Client (P5-010)
 *
 * Client for tag CRUD operations.
 */

import { apiDelete, apiGet, apiPatch, apiPost } from "./fetch";

/**
 * Tag data from API
 */
export interface Tag {
  id: string;
  userId: string;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  /** Number of bookmarks with this tag */
  bookmarkCount?: number;
}

/**
 * Create tag input
 */
export interface CreateTagInput {
  name: string;
  color?: string;
}

/**
 * Update tag input
 */
export interface UpdateTagInput {
  name?: string;
  color?: string;
}

/**
 * Tag list response
 */
export interface TagListResponse {
  data: Tag[];
}

/**
 * Tags API client
 */
export const tagsApi = {
  /**
   * List all tags for current user
   */
  list(): Promise<TagListResponse> {
    return apiGet<TagListResponse>("/tags");
  },

  /**
   * Get single tag by ID
   */
  get(id: string): Promise<{ data: Tag }> {
    return apiGet<{ data: Tag }>(`/tags/${id}`);
  },

  /**
   * Create new tag
   */
  create(input: CreateTagInput): Promise<{ data: Tag }> {
    return apiPost<{ data: Tag }>("/tags", input);
  },

  /**
   * Update tag
   */
  update(id: string, input: UpdateTagInput): Promise<{ data: Tag }> {
    return apiPatch<{ data: Tag }>(`/tags/${id}`, input);
  },

  /**
   * Delete tag
   */
  delete(id: string): Promise<void> {
    return apiDelete(`/tags/${id}`);
  },

  /**
   * Get popular tags (sorted by bookmark count)
   */
  popular(limit = 20): Promise<TagListResponse> {
    return apiGet<TagListResponse>("/tags", { sortBy: "bookmarkCount", limit });
  },
};
