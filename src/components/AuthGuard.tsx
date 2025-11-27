/**
 * AuthGuard Component
 *
 * Protects routes that require authentication.
 * Redirects to login page if user is not authenticated.
 */

import { Navigate, useLocation } from "react-router-dom";
import { useSession } from "@/lib/auth-client";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  fallback,
  redirectTo = "/login",
}: AuthGuardProps) {
  const location = useLocation();
  const { data, isPending } = useSession();

  // Show loading state while checking authentication
  if (isPending) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!data?.user) {
    // Save the current location to redirect back after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/**
 * GuestGuard Component
 *
 * Protects routes that should only be accessible to non-authenticated users.
 * Redirects to dashboard if user is already authenticated.
 */
interface GuestGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function GuestGuard({
  children,
  fallback,
  redirectTo = "/dashboard",
}: GuestGuardProps) {
  const location = useLocation();
  const { data, isPending } = useSession();

  // Show loading state while checking authentication
  if (isPending) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (data?.user) {
    // Check if we have a saved location to redirect to
    const from =
      (location.state as { from?: Location })?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
