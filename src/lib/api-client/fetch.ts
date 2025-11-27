/**
 * Fetch Wrapper with Error Handling (P5-006)
 *
 * Centralized fetch utility for all API calls.
 * Handles authentication, error parsing, and response formatting.
 */

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * API success response structure
 */
export interface ApiSuccessResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

/**
 * Custom API error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /**
   * Check if error is an authentication error
   */
  get isAuthError(): boolean {
    return this.status === 401;
  }

  /**
   * Check if error is a forbidden error
   */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /**
   * Check if error is a not found error
   */
  get isNotFound(): boolean {
    return this.status === 404;
  }

  /**
   * Check if error is a validation error
   */
  get isValidationError(): boolean {
    return this.status === 400;
  }

  /**
   * Check if error is a rate limit error
   */
  get isRateLimited(): boolean {
    return this.status === 429;
  }

  /**
   * Check if error is a server error
   */
  get isServerError(): boolean {
    return this.status >= 500;
  }
}

/**
 * Request options
 */
export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Base API URL
 */
const API_BASE_URL = "/api";

/**
 * Build URL with query parameters
 */
function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): string {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

/**
 * Parse error response
 */
async function parseError(response: Response): Promise<ApiError> {
  try {
    const data = (await response.json()) as ApiErrorResponse;
    return new ApiError(
      data.error || response.statusText,
      response.status,
      data.code,
      data.details,
    );
  } catch {
    return new ApiError(response.statusText, response.status);
  }
}

/**
 * Main fetch wrapper
 */
export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, params, ...init } = options;

  const url = buildUrl(path, params);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...init.headers,
  };

  const response = await fetch(url, {
    ...init,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include", // Include cookies for auth
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  // If response has data wrapper, extract it
  if (data && typeof data === "object" && "data" in data) {
    return data as T;
  }

  return data as T;
}

/**
 * GET request helper
 */
export function apiGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  return apiFetch<T>(path, { method: "GET", params });
}

/**
 * POST request helper
 */
export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, { method: "POST", body });
}

/**
 * PATCH request helper
 */
export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, { method: "PATCH", body });
}

/**
 * PUT request helper
 */
export function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, { method: "PUT", body });
}

/**
 * DELETE request helper
 */
export function apiDelete<T = void>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: "DELETE" });
}
