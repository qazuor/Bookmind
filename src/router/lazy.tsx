/**
 * Lazy-loaded page components (P5-025)
 *
 * Configures lazy loading for non-critical routes to improve initial load time.
 */

import { type ComponentType, lazy, Suspense } from "react";

/**
 * Loading fallback component
 */
function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Create a lazy component with suspense wrapper
 */
export function lazyPage(
  importFn: () => Promise<
    { default: ComponentType<unknown> } | Record<string, ComponentType<unknown>>
  >,
  exportName?: string,
) {
  const LazyComponent = lazy(async () => {
    const module = await importFn();
    if (exportName && exportName in module) {
      const Component = (module as Record<string, ComponentType<unknown>>)[
        exportName
      ];
      if (!Component) {
        throw new Error(`Export "${exportName}" not found in module`);
      }
      return { default: Component };
    }
    return module as { default: ComponentType<unknown> };
  });

  return function LazyPageWrapper() {
    return (
      <Suspense fallback={<PageLoading />}>
        <LazyComponent />
      </Suspense>
    );
  };
}

// ============================================================================
// Auth Pages
// ============================================================================

export const LoginPage = lazyPage(
  () => import("@/pages/auth/LoginPage"),
  "LoginPage",
);

export const SignupPage = lazyPage(
  () => import("@/pages/auth/SignupPage"),
  "SignupPage",
);

export const ForgotPasswordPage = lazyPage(
  () => import("@/pages/auth/ForgotPasswordPage"),
  "ForgotPasswordPage",
);

export const ResetPasswordPage = lazyPage(
  () => import("@/pages/auth/ResetPasswordPage"),
  "ResetPasswordPage",
);

// ============================================================================
// Public Pages
// ============================================================================

export const LandingPage = lazyPage(
  () => import("@/pages/public/LandingPage"),
  "LandingPage",
);

export const PrivacyPage = lazyPage(
  () => import("@/pages/public/PrivacyPage"),
  "PrivacyPage",
);

export const TermsPage = lazyPage(
  () => import("@/pages/public/TermsPage"),
  "TermsPage",
);

export const PublicProfilePage = lazyPage(
  () => import("@/pages/public/PublicProfilePage"),
  "PublicProfilePage",
);

export const SharedBookmarkPage = lazyPage(
  () => import("@/pages/public/SharedBookmarkPage"),
  "SharedBookmarkPage",
);

export const SharedCollectionPage = lazyPage(
  () => import("@/pages/public/SharedCollectionPage"),
  "SharedCollectionPage",
);

// ============================================================================
// Error Pages
// ============================================================================

export const NotFoundPage = lazyPage(
  () => import("@/pages/errors/NotFoundPage"),
  "NotFoundPage",
);

export const ErrorPage = lazyPage(
  () => import("@/pages/errors/ErrorPage"),
  "ErrorPage",
);

// ============================================================================
// Dashboard Pages
// ============================================================================

export const DashboardPage = lazyPage(
  () => import("@/pages/dashboard/DashboardPage"),
  "DashboardPage",
);

// ============================================================================
// Bookmark Pages
// ============================================================================

export const BookmarksPage = lazyPage(
  () => import("@/pages/bookmarks/BookmarksPage"),
  "BookmarksPage",
);

export const BookmarkDetailPage = lazyPage(
  () => import("@/pages/bookmarks/BookmarkDetailPage"),
  "BookmarkDetailPage",
);

export const NewBookmarkPage = lazyPage(
  () => import("@/pages/bookmarks/NewBookmarkPage"),
  "NewBookmarkPage",
);

export const ArchivePage = lazyPage(
  () => import("@/pages/bookmarks/ArchivePage"),
  "ArchivePage",
);

// ============================================================================
// Collection Pages
// ============================================================================

export const CollectionsPage = lazyPage(
  () => import("@/pages/collections/CollectionsPage"),
  "CollectionsPage",
);

export const CollectionDetailPage = lazyPage(
  () => import("@/pages/collections/CollectionDetailPage"),
  "CollectionDetailPage",
);

// ============================================================================
// Category Pages
// ============================================================================

export const CategoriesPage = lazyPage(
  () => import("@/pages/categories/CategoriesPage"),
  "CategoriesPage",
);

// ============================================================================
// Tag Pages
// ============================================================================

export const TagsPage = lazyPage(
  () => import("@/pages/tags/TagsPage"),
  "TagsPage",
);

// ============================================================================
// Search Pages
// ============================================================================

export const SearchPage = lazyPage(
  () => import("@/pages/search/SearchPage"),
  "SearchPage",
);

// ============================================================================
// Settings Pages
// ============================================================================

export const SettingsPage = lazyPage(
  () => import("@/pages/settings/SettingsPage"),
  "SettingsPage",
);

export const ProfilePage = lazyPage(
  () => import("@/pages/settings/ProfilePage"),
  "ProfilePage",
);

// ============================================================================
// Stats Pages
// ============================================================================

export const StatsPage = lazyPage(
  () => import("@/pages/stats/StatsPage"),
  "StatsPage",
);

// ============================================================================
// Export Pages
// ============================================================================

export const ExportPage = lazyPage(
  () => import("@/pages/export/ExportPage"),
  "ExportPage",
);
