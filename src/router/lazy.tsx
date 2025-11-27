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

// Auth pages (loaded immediately as they're entry points)
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

// Dashboard (preload for logged-in users)
export const DashboardPage = lazyPage(
  () => import("@/pages/dashboard/DashboardPage"),
  "DashboardPage",
);

// Bookmarks
export const BookmarksPage = lazyPage(
  () => import("@/pages/bookmarks/BookmarksPage"),
  "BookmarksPage",
);

export const BookmarkDetailPage = lazyPage(
  () => import("@/pages/bookmarks/BookmarkDetailPage"),
  "BookmarkDetailPage",
);

// Collections
export const CollectionsPage = lazyPage(
  () => import("@/pages/collections/CollectionsPage"),
  "CollectionsPage",
);

export const CollectionDetailPage = lazyPage(
  () => import("@/pages/collections/CollectionDetailPage"),
  "CollectionDetailPage",
);

// Categories
export const CategoriesPage = lazyPage(
  () => import("@/pages/categories/CategoriesPage"),
  "CategoriesPage",
);

// Tags
export const TagsPage = lazyPage(
  () => import("@/pages/tags/TagsPage"),
  "TagsPage",
);

// Search
export const SearchPage = lazyPage(
  () => import("@/pages/search/SearchPage"),
  "SearchPage",
);

// Settings
export const SettingsPage = lazyPage(
  () => import("@/pages/settings/SettingsPage"),
  "SettingsPage",
);
