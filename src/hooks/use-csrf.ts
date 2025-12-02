/**
 * CSRF Token Hook (P9-001)
 *
 * Manages CSRF token retrieval and storage for form submissions.
 */

import { useCallback, useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client/fetch";

interface CsrfTokenResponse {
  token: string;
}

/**
 * Storage key for CSRF token
 */
const CSRF_STORAGE_KEY = "csrf_token";

/**
 * Get stored CSRF token from session storage
 */
function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(CSRF_STORAGE_KEY);
}

/**
 * Store CSRF token in session storage
 */
function storeToken(token: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CSRF_STORAGE_KEY, token);
}

/**
 * Clear stored CSRF token
 */
function clearToken(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CSRF_STORAGE_KEY);
}

/**
 * Hook for managing CSRF tokens
 *
 * @example
 * ```tsx
 * function MyForm() {
 *   const { token, refreshToken, isLoading } = useCsrfToken();
 *
 *   const handleSubmit = async (data) => {
 *     await apiPost('/api/something', { ...data, _csrf: token });
 *     refreshToken(); // Get new token after mutation
 *   };
 * }
 * ```
 */
export function useCsrfToken() {
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch a new CSRF token from the server
   */
  const refreshToken = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiGet<CsrfTokenResponse>("/csrf-token");
      const newToken = response.token;
      storeToken(newToken);
      setToken(newToken);
      return newToken;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch CSRF token"),
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear the current token
   */
  const clear = useCallback(() => {
    clearToken();
    setToken(null);
  }, []);

  // Fetch token on mount if not available
  useEffect(() => {
    if (!token) {
      refreshToken();
    }
  }, [token, refreshToken]);

  return {
    token,
    isLoading,
    error,
    refreshToken,
    clear,
  };
}

/**
 * Get current CSRF token synchronously (for use outside React)
 */
export function getCsrfToken(): string | null {
  return getStoredToken();
}
