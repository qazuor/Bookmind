/**
 * Services Exports
 *
 * Business logic layer for all entities.
 */

export {
  archiveBookmark,
  type BookmarkWithRelations,
  bookmarkExists,
  bulkArchiveBookmarks,
  bulkDeleteBookmarks,
  bulkMoveToCategory,
  createBookmark,
  deleteBookmark,
  getBookmarkById,
  getBookmarkByUrl,
  getBookmarkCountsByCategory,
  getBookmarks,
  getPinnedBookmarks,
  getRecentBookmarks,
  type PaginatedResult,
  pinBookmark,
  updateBookmark,
  updateBookmarkAiContent,
  updateBookmarkMetadata,
} from "./bookmarks";
export {
  createCategory,
  createDefaultCategories,
  deleteCategory,
  ensureUserHasCategories,
  getCategoryById,
  getUserCategories,
  getUserCategoriesWithCounts,
  updateCategory,
  userHasCategories,
} from "./categories";

export {
  addBookmarksToCollection,
  createCollection,
  deleteCollection,
  getChildCollections,
  getCollectionById,
  getCollectionByName,
  getCollectionTree,
  getCollectionWithCount,
  getSharedCollection,
  getSharedCollectionBookmarks,
  getUserCollections,
  getUserCollectionsWithCounts,
  removeBookmarksFromCollection,
  shareCollection,
  unshareCollection,
  updateCollection,
  validateParentCollection,
} from "./collections";
export {
  type ExportOptions,
  generateCsvExport,
  generateHtmlExport,
  generateJsonExport,
  getExportExtension,
  getExportMimeType,
} from "./export";

export {
  type ExtractedMetadata,
  extractAndUpdateBookmark,
  extractMetadata,
  getGoogleFaviconUrl,
  type UrlValidationResult,
  validateUrl,
} from "./metadata";
export {
  type ActivityDataPoint,
  getActivityData,
  getTopCollections,
  getTopTags,
  getUserStats,
  type UserStats,
} from "./stats";
export {
  autocompleteTag,
  createTag,
  deleteTag,
  getOrCreateTag,
  getOrCreateTags,
  getTagById,
  getTagByName,
  getTagCloud,
  getUserTags,
  getUserTagsWithCounts,
  updateTag,
} from "./tags";

export {
  getPublicUserProfile,
  getUserByEmail,
  getUserById,
  getUserByUsername,
  isUsernameAvailable,
  updateUserPreferences,
  updateUserProfile,
} from "./users";
