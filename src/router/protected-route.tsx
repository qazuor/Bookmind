/**
 * Protected Route Wrapper (P5-024)
 *
 * Wraps routes that require authentication.
 * Redirects to login if user is not authenticated.
 */

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks";

/**
 * Props for ProtectedRoute
 */
interface ProtectedRouteProps {
  /** Children to render if authenticated */
  children?: React.ReactNode;
  /** Redirect path when not authenticated */
  redirectTo?: string;
}

/**
 * Loading state while checking authentication
 */
function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">
          Checking authentication...
        </p>
      </div>
    </div>
  );
}

/**
 * Protected route component
 *
 * Wraps routes that require authentication. If the user is not authenticated,
 * they are redirected to the login page with the original URL preserved.
 */
export function ProtectedRoute({
  children,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (isLoading) {
    return <AuthLoading />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Preserve the attempted URL for redirecting after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Render children or outlet for nested routes
  if (children) {
    return children;
  }
  return <Outlet />;
}

/**
 * Public route component (redirect authenticated users)
 *
 * Wraps routes that should only be accessible to unauthenticated users.
 * If the user is already authenticated, they are redirected to the dashboard.
 */
export function PublicRoute({
  children,
  redirectTo = "/",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (isLoading) {
    return <AuthLoading />;
  }

  // Redirect authenticated users to dashboard or their intended destination
  if (isAuthenticated) {
    const from =
      (location.state as { from?: Location })?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  // Render children or outlet for nested routes
  if (children) {
    return children;
  }
  return <Outlet />;
}
