/**
 * Categories API Client (P5-008)
 *
 * Client for category CRUD operations.
 */

import { apiDelete, apiGet, apiPatch, apiPost } from "./fetch";

/**
 * Category data from API
 */
export interface Category {
  id: string;
  userId: string;
  name: string;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  /** Number of bookmarks in this category */
  bookmarkCount?: number;
}

/**
 * Create category input
 */
export interface CreateCategoryInput {
  name: string;
  color?: string;
  icon?: string;
}

/**
 * Update category input
 */
export interface UpdateCategoryInput {
  name?: string;
  color?: string;
  icon?: string;
}

/**
 * Category list response
 */
export interface CategoryListResponse {
  data: Category[];
}

/**
 * Categories API client
 */
export const categoriesApi = {
  /**
   * List all categories for current user
   */
  list(): Promise<CategoryListResponse> {
    return apiGet<CategoryListResponse>("/categories");
  },

  /**
   * Get single category by ID
   */
  get(id: string): Promise<{ data: Category }> {
    return apiGet<{ data: Category }>(`/categories/${id}`);
  },

  /**
   * Create new category
   */
  create(input: CreateCategoryInput): Promise<{ data: Category }> {
    return apiPost<{ data: Category }>("/categories", input);
  },

  /**
   * Update category
   */
  update(id: string, input: UpdateCategoryInput): Promise<{ data: Category }> {
    return apiPatch<{ data: Category }>(`/categories/${id}`, input);
  },

  /**
   * Delete category
   */
  delete(id: string): Promise<void> {
    return apiDelete(`/categories/${id}`);
  },
};
