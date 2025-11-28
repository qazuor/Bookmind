/**
 * Hooks barrel export
 *
 * Re-exports all custom hooks for convenient imports.
 */

// Authentication
export { useAuth } from "./use-auth";
export { useBookmark, usePrefetchBookmark } from "./use-bookmark";
// Bookmark hooks
export {
  useAISuggestions,
  useArchiveBookmark,
  useArchivedBookmarks,
  useBookmarks,
  useBulkBookmarkOperation,
  useCreateBookmark,
  useDeleteBookmark,
  useFavoriteBookmarks,
  useRegenerateSummary,
  useToggleFavorite,
  useUnarchiveBookmark,
  useUpdateBookmark,
} from "./use-bookmarks";

// Category hooks
export {
  useCategories,
  useCategory,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "./use-categories";

// Collection hooks
export {
  useCollection,
  useCollections,
  useCollectionTree,
  useCreateCollection,
  useDeleteCollection,
  useShareCollection,
  useSharedCollection,
  useUnshareCollection,
  useUpdateCollection,
} from "./use-collections";
// Utility hooks
export { useDebouncedCallback, useDebouncedValue } from "./use-debounced-value";
// Export hook
export { useExport } from "./use-export";
export type { UseI18nReturn } from "./use-i18n";
// i18n hook
export { useI18n } from "./use-i18n";
// Search hooks
export {
  useSearch,
  useSearchSuggestions,
  useSemanticSearch,
  useTextSearch,
} from "./use-search";
// Stats hooks
export {
  useActivityStats,
  useDashboardStats,
  useOverviewStats,
} from "./use-stats";
// Tag hooks
export {
  useCreateTag,
  useDeleteTag,
  usePopularTags,
  useTag,
  useTags,
  useUpdateTag,
} from "./use-tags";
// Theme hook
export { useTheme } from "./use-theme";
