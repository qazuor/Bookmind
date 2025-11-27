/**
 * Route Definitions (P5-023)
 *
 * Defines all application routes with their components and configurations.
 */

import type { RouteObject } from "react-router-dom";
import {
  BookmarkDetailPage,
  BookmarksPage,
  CategoriesPage,
  CollectionDetailPage,
  CollectionsPage,
  // Protected pages
  DashboardPage,
  ForgotPasswordPage,
  // Auth pages
  LoginPage,
  ResetPasswordPage,
  SearchPage,
  SettingsPage,
  SignupPage,
  TagsPage,
} from "./lazy";
import { ProtectedRoute, PublicRoute } from "./protected-route";

/**
 * Public routes (accessible without authentication)
 */
const publicRoutes: RouteObject[] = [
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
    children: [
      {
        path: "/",
        element: <DashboardPage />,
      },
      {
        path: "/bookmarks",
        element: <BookmarksPage />,
      },
      {
        path: "/bookmarks/:id",
        element: <BookmarkDetailPage />,
      },
      {
        path: "/collections",
        element: <CollectionsPage />,
      },
      {
        path: "/collections/:id",
        element: <CollectionDetailPage />,
      },
      {
        path: "/categories",
        element: <CategoriesPage />,
      },
      {
        path: "/tags",
        element: <TagsPage />,
      },
      {
        path: "/search",
        element: <SearchPage />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
    ],
  },
];

/**
 * 404 Not Found route
 */
const notFoundRoute: RouteObject = {
  path: "*",
  element: (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-muted-foreground">Page not found</p>
      <a href="/" className="mt-4 text-primary hover:underline">
        Go home
      </a>
    </div>
  ),
};

/**
 * All application routes
 */
export const routes: RouteObject[] = [
  ...publicRoutes,
  ...protectedRoutes,
  notFoundRoute,
];

/**
 * Route paths for type-safe navigation
 */
export const routePaths = {
  // Auth
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",

  // Dashboard
  dashboard: "/",

  // Bookmarks
  bookmarks: "/bookmarks",
  bookmarkDetail: (id: string) => `/bookmarks/${id}`,

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
} as const;

/**
 * Type for route path values
 */
export type RoutePath = (typeof routePaths)[keyof typeof routePaths];
