/**
 * Collections API Client (P5-009)
 *
 * Client for collection CRUD operations and sharing.
 */

import { apiDelete, apiGet, apiPatch, apiPost } from "./fetch";

/**
 * Collection data from API
 */
export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  parentId?: string;
  shareToken?: string;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
  /** Number of bookmarks in this collection */
  bookmarkCount?: number;
  /** Child collections (for tree view) */
  children?: Collection[];
}

/**
 * Create collection input
 */
export interface CreateCollectionInput {
  name: string;
  description?: string;
  parentId?: string;
}

/**
 * Update collection input
 */
export interface UpdateCollectionInput {
  name?: string;
  description?: string;
  parentId?: string | null;
}

/**
 * Collection list response
 */
export interface CollectionListResponse {
  data: Collection[];
}

/**
 * Collection tree response
 */
export interface CollectionTreeResponse {
  data: Collection[];
}

/**
 * Share response
 */
export interface ShareResponse {
  data: {
    shareToken: string;
    shareUrl: string;
  };
}

/**
 * Shared collection response (public)
 */
export interface SharedCollectionResponse {
  data: {
    collection: {
      name: string;
      description?: string;
    };
    bookmarks: Array<{
      id: string;
      url: string;
      title: string;
      description?: string;
      favicon?: string;
      createdAt: string;
    }>;
    owner: {
      username: string;
      displayName?: string;
    };
  };
}

/**
 * Collections API client
 */
export const collectionsApi = {
  /**
   * List all collections for current user (flat)
   */
  list(): Promise<CollectionListResponse> {
    return apiGet<CollectionListResponse>("/collections");
  },

  /**
   * Get collections as tree (nested)
   */
  tree(): Promise<CollectionTreeResponse> {
    return apiGet<CollectionTreeResponse>("/collections", { tree: true });
  },

  /**
   * Get single collection by ID
   */
  get(id: string): Promise<{ data: Collection }> {
    return apiGet<{ data: Collection }>(`/collections/${id}`);
  },

  /**
   * Create new collection
   */
  create(input: CreateCollectionInput): Promise<{ data: Collection }> {
    return apiPost<{ data: Collection }>("/collections", input);
  },

  /**
   * Update collection
   */
  update(
    id: string,
    input: UpdateCollectionInput,
  ): Promise<{ data: Collection }> {
    return apiPatch<{ data: Collection }>(`/collections/${id}`, input);
  },

  /**
   * Delete collection
   */
  delete(id: string): Promise<void> {
    return apiDelete(`/collections/${id}`);
  },

  /**
   * Generate share link for collection
   */
  share(id: string): Promise<ShareResponse> {
    return apiPost<ShareResponse>(`/collections/${id}/share`);
  },

  /**
   * Revoke share link
   */
  unshare(id: string): Promise<void> {
    return apiDelete(`/collections/${id}/share`);
  },

  /**
   * Get shared collection by token (public)
   */
  getShared(token: string): Promise<SharedCollectionResponse> {
    return apiGet<SharedCollectionResponse>(`/shared/collections/${token}`);
  },
};
