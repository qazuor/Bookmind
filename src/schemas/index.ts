// User schemas

// Auth schemas
export {
  type ChangePasswordInput,
  changePasswordSchema,
  type ForgotPasswordInput,
  forgotPasswordSchema,
  type LoginInput,
  loginSchema,
  type OAuthCallbackInput,
  oauthCallbackSchema,
  type ResendVerificationInput,
  type ResetPasswordInput,
  resendVerificationSchema,
  resetPasswordSchema,
  type SessionResponse,
  type SignupInput,
  sessionResponseSchema,
  signupSchema,
  type VerifyEmailInput,
  verifyEmailSchema,
} from "./auth.schema";

// Bookmark schemas
export {
  type BookmarkFilters,
  type BookmarkResponse,
  bookmarkFiltersSchema,
  bookmarkResponseSchema,
  type CreateBookmarkInput,
  createBookmarkSchema,
  type ListBookmarksInput,
  listBookmarksSchema,
  type PaginatedBookmarks,
  type Pagination,
  paginatedBookmarksSchema,
  paginationSchema,
  type UpdateBookmarkInput,
  updateBookmarkSchema,
} from "./bookmark.schema";

// Category schemas
export {
  type CategoryResponse,
  type CreateCategoryInput,
  categoryResponseSchema,
  createCategorySchema,
  defaultCategories,
  type UpdateCategoryInput,
  updateCategorySchema,
} from "./category.schema";

// Collection schemas
export {
  type CollectionBookmarksInput,
  type CollectionResponse,
  type CollectionShareInput,
  type CollectionTree,
  type CreateCollectionInput,
  collectionBookmarksSchema,
  collectionResponseSchema,
  collectionShareSchema,
  collectionTreeSchema,
  createCollectionSchema,
  type SharedCollection,
  sharedCollectionSchema,
  type UpdateCollectionInput,
  updateCollectionSchema,
} from "./collection.schema";
// Export schemas
export {
  type CsvColumnMapping,
  csvColumnMappingSchema,
  type ExportFormat,
  type ExportOptions,
  type ExportResult,
  exportFormatSchema,
  exportOptionsSchema,
  exportResultSchema,
  type ImportOptions,
  type ImportResult,
  importOptionsSchema,
  importResultSchema,
} from "./export.schema";
// Search schemas
export {
  type SearchQueryInput,
  type SearchResult,
  type SearchResults,
  type SearchSuggestion,
  type SearchSuggestionsInput,
  type SemanticSearchInput,
  searchQuerySchema,
  searchResultSchema,
  searchResultsSchema,
  searchSuggestionSchema,
  searchSuggestionsSchema,
  semanticSearchSchema,
} from "./search.schema";
// Tag schemas
export {
  type BulkTagInput,
  bulkTagSchema,
  type CreateTagInput,
  createTagSchema,
  type TagAutocompleteInput,
  type TagCloudItem,
  type TagResponse,
  tagAutocompleteSchema,
  tagCloudItemSchema,
  tagResponseSchema,
  type UpdateTagInput,
  updateTagSchema,
} from "./tag.schema";
export {
  type CreateUserInput,
  createUserSchema,
  type PublicUser,
  publicUserSchema,
  type UpdateUserInput,
  type UserPreferences,
  type UserResponse,
  updateUserSchema,
  userPreferencesSchema,
  userResponseSchema,
} from "./user.schema";
