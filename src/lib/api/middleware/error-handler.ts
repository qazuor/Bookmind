/**
 * Error Handling Middleware (P3-005)
 *
 * Standardized error handling for all API endpoints.
 * Catches errors and returns consistent error responses.
 */

import type { VercelResponse } from "@vercel/node";
import { type ApiError, handleError, sendError } from "../errors";
import type { ApiRequest } from "../types";

/**
 * Error handler configuration
 */
interface ErrorHandlerConfig {
  /** Log errors to console */
  logErrors?: boolean;
  /** Include stack trace in development */
  includeStack?: boolean;
  /** Custom error transformer */
  transformError?: (error: unknown) => ApiError;
  /** Custom error logger */
  onError?: (error: ApiError, req: ApiRequest) => void;
}

const DEFAULT_CONFIG: ErrorHandlerConfig = {
  logErrors: true,
  includeStack: process.env.NODE_ENV === "development",
};

/**
 * Wrap handler with error handling
 *
 * @example
 * ```ts
 * export default withErrorHandler(async (req, res) => {
 *   // Errors thrown here will be caught and formatted
 *   throw new NotFoundError("Bookmark");
 * });
 * ```
 */
export function withErrorHandler<TBody = unknown, TQuery = unknown>(
  configOrHandler:
    | ErrorHandlerConfig
    | ((
        req: ApiRequest<TBody, TQuery>,
        res: VercelResponse,
      ) => Promise<void | VercelResponse>),
  maybeHandler?: (
    req: ApiRequest<TBody, TQuery>,
    res: VercelResponse,
  ) => Promise<void | VercelResponse>,
) {
  const config: ErrorHandlerConfig =
    typeof configOrHandler === "function"
      ? DEFAULT_CONFIG
      : { ...DEFAULT_CONFIG, ...configOrHandler };
  const handler =
    typeof configOrHandler === "function" ? configOrHandler : maybeHandler!;

  return async (
    req: ApiRequest<TBody, TQuery>,
    res: VercelResponse,
  ): Promise<void | VercelResponse> => {
    try {
      return await handler(req, res);
    } catch (error) {
      // Transform error to ApiError
      const apiError = config.transformError
        ? config.transformError(error)
        : handleError(error);

      // Log error
      if (config.logErrors) {
        const logData = {
          code: apiError.code,
          message: apiError.message,
          statusCode: apiError.statusCode,
          path: req.url,
          method: req.method,
          userId: req.userId,
          timestamp: new Date().toISOString(),
        };

        if (apiError.statusCode >= 500) {
          console.error(
            "[API Error]",
            logData,
            config.includeStack ? apiError.stack : "",
          );
        } else if (config.includeStack) {
          console.warn("[API Warning]", logData);
        }
      }

      // Call custom error handler
      if (config.onError) {
        try {
          config.onError(apiError, req as ApiRequest);
        } catch (e) {
          console.error("[Error Handler] onError callback failed:", e);
        }
      }

      return sendError(res, apiError);
    }
  };
}

/**
 * Async handler wrapper (simpler version)
 *
 * @example
 * ```ts
 * export default asyncHandler(async (req, res) => {
 *   const data = await someAsyncOperation();
 *   res.json({ data });
 * });
 * ```
 */
export function asyncHandler<TBody = unknown, TQuery = unknown>(
  handler: (
    req: ApiRequest<TBody, TQuery>,
    res: VercelResponse,
  ) => Promise<void | VercelResponse>,
) {
  return withErrorHandler(handler);
}

/**
 * Create a global error handler for uncaught errors
 *
 * Use this at the top level of your API
 */
export function createGlobalErrorHandler() {
  return (error: unknown, _req: ApiRequest, res: VercelResponse): void => {
    console.error("[Uncaught Error]", error);

    const apiError = handleError(error);
    sendError(res, apiError);
  };
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Try-catch wrapper for async operations
 *
 * @example
 * ```ts
 * const [data, error] = await tryCatch(() => fetchData());
 * if (error) {
 *   // Handle error
 * }
 * ```
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
): Promise<[T, null] | [null, Error]> {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}
