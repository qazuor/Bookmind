/**
 * API Client Barrel Export
 *
 * Re-exports all API clients and types for convenient imports.
 */

// Bookmarks
export {
  type AISuggestionsResponse,
  type Bookmark,
  type BookmarkFilters,
  type BookmarkListResponse,
  type BulkOperationInput,
  bookmarksApi,
  type CreateBookmarkInput,
  type UpdateBookmarkInput,
} from "./bookmarks";
// Categories
export {
  type Category,
  type CategoryListResponse,
  type CreateCategoryInput,
  categoriesApi,
  type UpdateCategoryInput,
} from "./categories";
// Collections
export {
  type Collection,
  type CollectionListResponse,
  type CollectionTreeResponse,
  type CreateCollectionInput,
  collectionsApi,
  type SharedCollectionResponse,
  type ShareResponse,
  type UpdateCollectionInput,
} from "./collections";
// Export
export {
  type ExportFormat,
  type ExportOptions,
  exportApi,
} from "./export";
// Fetch utilities
export {
  ApiError,
  type ApiErrorResponse,
  type ApiSuccessResponse,
  apiDelete,
  apiFetch,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
  type RequestOptions,
} from "./fetch";

// Search
export {
  type SearchFilters,
  type SearchSuggestionsResponse,
  type SemanticSearchResponse,
  type SemanticSearchResult,
  searchApi,
  type TextSearchResponse,
} from "./search";
// Stats
export {
  type ActivityItem,
  type ActivityStatsResponse,
  type CategoryStat,
  type OverviewStatsResponse,
  statsApi,
  type TagStat,
} from "./stats";
// Tags
export {
  type CreateTagInput,
  type Tag,
  type TagListResponse,
  tagsApi,
  type UpdateTagInput,
} from "./tags";

// User
export {
  type PublicProfileResponse,
  type UpdateProfileInput,
  type UserProfile,
  userApi,
} from "./user";
