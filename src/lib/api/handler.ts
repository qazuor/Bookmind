/**
 * API Handler Builder
 *
 * Compose multiple middleware into a single handler.
 * Provides a clean, fluent API for building route handlers.
 */

import type { VercelResponse } from "@vercel/node";
import type { z } from "zod";
import { MethodNotAllowedError, sendError } from "./errors";
import { withBotProtection } from "./middleware/bot-protection";
import { withCsrf } from "./middleware/csrf";
import { withErrorHandler } from "./middleware/error-handler";
import { withLogging } from "./middleware/logging";
import { type RateLimitType, withRateLimit } from "./middleware/rate-limit";
import { withValidation } from "./middleware/validation";
import type {
  ApiRequest,
  HttpMethod,
  RateLimitConfig,
  ValidationConfig,
} from "./types";

/**
 * Route handler builder configuration
 */
interface HandlerConfig<
  TBody extends z.ZodType = z.ZodType<unknown>,
  TQuery extends z.ZodType = z.ZodType<unknown>,
> {
  /** Allowed HTTP methods */
  methods?: HttpMethod[];
  /** Validation schemas */
  validation?: ValidationConfig<TBody, TQuery>;
  /** Rate limit type or custom config */
  rateLimit?: RateLimitType | RateLimitConfig | false;
  /** Enable CSRF protection */
  csrf?: boolean;
  /** Enable bot protection */
  botProtection?: boolean;
  /** Enable request logging */
  logging?: boolean;
  /** Require authentication */
  auth?: boolean;
}

/**
 * Create an API handler with middleware composition
 *
 * @example
 * ```ts
 * // Simple handler
 * export default createHandler(async (req, res) => {
 *   sendSuccess(res, { message: "Hello" });
 * });
 *
 * // With configuration
 * export default createHandler({
 *   methods: ["GET", "POST"],
 *   validation: { body: createBookmarkSchema },
 *   rateLimit: "api",
 * }, async (req, res) => {
 *   // req.parsedBody is typed and validated
 *   sendSuccess(res, req.parsedBody);
 * });
 * ```
 */
export function createHandler<
  TBody extends z.ZodType = z.ZodType<unknown>,
  TQuery extends z.ZodType = z.ZodType<unknown>,
>(
  configOrHandler:
    | HandlerConfig<TBody, TQuery>
    | ((
        req: ApiRequest<z.infer<TBody>, z.infer<TQuery>>,
        res: VercelResponse,
      ) => Promise<void | VercelResponse>),
  maybeHandler?: (
    req: ApiRequest<z.infer<TBody>, z.infer<TQuery>>,
    res: VercelResponse,
  ) => Promise<void | VercelResponse>,
) {
  const config: HandlerConfig<TBody, TQuery> =
    typeof configOrHandler === "function" ? {} : configOrHandler;
  const handler =
    typeof configOrHandler === "function" ? configOrHandler : maybeHandler!;

  // Build the handler chain from inside out
  // Use type assertion to allow middleware composition
  type AnyHandler = (
    req: ApiRequest,
    res: VercelResponse,
  ) => Promise<void | VercelResponse>;
  let wrappedHandler: AnyHandler = handler as AnyHandler;

  // 1. Validation (innermost - after all checks)
  if (config.validation) {
    const validationHandler = wrappedHandler;
    // biome-ignore lint/suspicious/noExplicitAny: Middleware composition requires flexible types
    wrappedHandler = withValidation(
      config.validation as any,
      validationHandler as any,
    ) as AnyHandler;
  }

  // 2. CSRF protection
  if (config.csrf !== false) {
    const csrfHandler = wrappedHandler;
    wrappedHandler = withCsrf(csrfHandler);
  }

  // 3. Bot protection
  if (config.botProtection !== false) {
    const botHandler = wrappedHandler;
    wrappedHandler = withBotProtection(botHandler);
  }

  // 4. Rate limiting
  if (config.rateLimit !== false) {
    const rateLimitHandler = wrappedHandler;
    const rateType = config.rateLimit || "api";
    wrappedHandler = withRateLimit(rateType, rateLimitHandler);
  }

  // 5. Logging
  if (config.logging !== false) {
    const loggingHandler = wrappedHandler;
    wrappedHandler = withLogging(loggingHandler);
  }

  // 6. Error handling (outermost)
  const errorHandler = wrappedHandler;
  wrappedHandler = withErrorHandler(errorHandler);

  // Final handler with method checking
  return async (
    req: ApiRequest,
    res: VercelResponse,
  ): Promise<void | VercelResponse> => {
    // Handle OPTIONS for CORS preflight
    if (req.method === "OPTIONS") {
      res.setHeader(
        "Access-Control-Allow-Methods",
        (config.methods || ["GET", "POST", "PUT", "PATCH", "DELETE"]).join(
          ", ",
        ),
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-CSRF-Token",
      );
      res.status(204).end();
      return;
    }

    // Check allowed methods
    if (config.methods && !config.methods.includes(req.method as HttpMethod)) {
      const error = new MethodNotAllowedError(
        req.method || "UNKNOWN",
        config.methods,
      );
      return sendError(res, error);
    }

    return wrappedHandler(req, res);
  };
}

/**
 * Create a simple GET handler
 */
export function createGetHandler<TQuery extends z.ZodType = z.ZodType<unknown>>(
  config: Omit<HandlerConfig<z.ZodType<unknown>, TQuery>, "methods"> & {
    validation?: { query?: TQuery };
  },
  handler: (
    req: ApiRequest<unknown, z.infer<TQuery>>,
    res: VercelResponse,
  ) => Promise<void | VercelResponse>,
) {
  return createHandler({ ...config, methods: ["GET"] }, handler);
}

/**
 * Create a simple POST handler
 */
export function createPostHandler<TBody extends z.ZodType = z.ZodType<unknown>>(
  config: Omit<HandlerConfig<TBody, z.ZodType<unknown>>, "methods"> & {
    validation?: { body?: TBody };
  },
  handler: (
    req: ApiRequest<z.infer<TBody>, unknown>,
    res: VercelResponse,
  ) => Promise<void | VercelResponse>,
) {
  return createHandler({ ...config, methods: ["POST"] }, handler);
}

// Re-export response helpers for convenience
export { sendError, sendSuccess } from "./errors";
