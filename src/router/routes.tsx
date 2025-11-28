/**
 * Route Definitions (P5-023, P7)
 *
 * Defines all application routes with their components and configurations.
 */

import type { RouteObject } from "react-router-dom";
import {
  ArchivePage,
  BookmarkDetailPage,
  // Bookmarks
  BookmarksPage,
  // Categories & Tags
  CategoriesPage,
  CollectionDetailPage,
  // Collections
  CollectionsPage,
  // Dashboard
  DashboardPage,
  ErrorPage,
  ExportPage,
  ForgotPasswordPage,
  // Public pages
  LandingPage,
  // Auth pages
  LoginPage,
  NewBookmarkPage,
  // Error pages
  NotFoundPage,
  PrivacyPage,
  ProfilePage,
  PublicProfilePage,
  ResetPasswordPage,
  // Search
  SearchPage,
  // Settings
  SettingsPage,
  SharedBookmarkPage,
  SharedCollectionPage,
  SignupPage,
  // Stats & Export
  StatsPage,
  TagsPage,
  TermsPage,
} from "./lazy";
import { ProtectedRoute, PublicRoute } from "./protected-route";

/**
 * Public routes (accessible by anyone, no auth required)
 */
const publicPagesRoutes: RouteObject[] = [
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/privacy",
    element: <PrivacyPage />,
  },
  {
    path: "/terms",
    element: <TermsPage />,
  },
  {
    path: "/u/:username",
    element: <PublicProfilePage />,
  },
  {
    path: "/share/:bookmarkId",
    element: <SharedBookmarkPage />,
  },
  {
    path: "/share/c/:token",
    element: <SharedCollectionPage />,
  },
];

/**
 * Auth routes (redirect to dashboard if already logged in)
 */
const authRoutes: RouteObject[] = [
  {
    element: <PublicRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/signup",
        element: <SignupPage />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "/reset-password",
        element: <ResetPasswordPage />,
      },
    ],
  },
];

/**
 * Protected routes (require authentication)
 */
const protectedRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      // Dashboard
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      // Bookmarks
      {
        path: "/bookmarks",
        element: <BookmarksPage />,
      },
      {
        path: "/bookmarks/new",
        element: <NewBookmarkPage />,
      },
      {
        path: "/bookmarks/:id",
        element: <BookmarkDetailPage />,
      },
      {
        path: "/archive",
        element: <ArchivePage />,
      },
      // Collections
      {
        path: "/collections",
        element: <CollectionsPage />,
      },
      {
        path: "/collections/:id",
        element: <CollectionDetailPage />,
      },
      // Categories
      {
        path: "/categories",
        element: <CategoriesPage />,
      },
      // Tags
      {
        path: "/tags",
        element: <TagsPage />,
      },
      // Search
      {
        path: "/search",
        element: <SearchPage />,
      },
      // Settings
      {
        path: "/settings",
        element: <SettingsPage />,
      },
      {
        path: "/settings/profile",
        element: <ProfilePage />,
      },
      // Stats
      {
        path: "/stats",
        element: <StatsPage />,
      },
      // Export
      {
        path: "/export",
        element: <ExportPage />,
      },
    ],
  },
];

/**
 * 404 Not Found route
 */
const notFoundRoute: RouteObject = {
  path: "*",
  element: <NotFoundPage />,
};

/**
 * All application routes
 */
export const routes: RouteObject[] = [
  ...publicPagesRoutes,
  ...authRoutes,
  ...protectedRoutes,
  notFoundRoute,
];

/**
 * Route paths for type-safe navigation
 */
export const routePaths = {
  // Public
  home: "/",
  privacy: "/privacy",
  terms: "/terms",
  publicProfile: (username: string) => `/u/${username}`,
  sharedBookmark: (id: string) => `/share/${id}`,
  sharedCollection: (token: string) => `/share/c/${token}`,

  // Auth
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",

  // Dashboard
  dashboard: "/dashboard",

  // Bookmarks
  bookmarks: "/bookmarks",
  newBookmark: "/bookmarks/new",
  bookmarkDetail: (id: string) => `/bookmarks/${id}`,
  archive: "/archive",

  // Collections
  collections: "/collections",
  collectionDetail: (id: string) => `/collections/${id}`,

  // Categories
  categories: "/categories",

  // Tags
  tags: "/tags",

  // Search
  search: "/search",

  // Settings
  settings: "/settings",
  profile: "/settings/profile",

  // Stats
  stats: "/stats",

  // Export
  export: "/export",
} as const;

/**
 * Type for route path values
 */
export type RoutePath = (typeof routePaths)[keyof typeof routePaths];
