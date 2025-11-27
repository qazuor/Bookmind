/**
 * API Types
 *
 * Common types used across all API endpoints.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { z } from "zod";

/**
 * Extended request with parsed body and query
 */
export interface ApiRequest<
  TBody = unknown,
  TQuery = Record<string, string | string[] | undefined>,
> extends VercelRequest {
  parsedBody?: TBody;
  parsedQuery?: TQuery;
  userId?: string;
  sessionId?: string;
}

/**
 * Standard API response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiErrorResponse;
  meta?: ApiMeta;
}

/**
 * Error response format
 */
export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

/**
 * Metadata for paginated responses
 */
export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

/**
 * API handler function type
 */
export type ApiHandler<TBody = unknown, TQuery = unknown> = (
  req: ApiRequest<TBody, TQuery>,
  res: VercelResponse,
) => Promise<void | VercelResponse>;

/**
 * Middleware function type
 */
export type Middleware = (
  req: ApiRequest,
  res: VercelResponse,
  next: () => Promise<void>,
) => Promise<void>;

/**
 * Validation schema configuration
 */
export interface ValidationConfig<
  TBody extends z.ZodType = z.ZodType,
  TQuery extends z.ZodType = z.ZodType,
> {
  body?: TBody;
  query?: TQuery;
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Maximum requests allowed */
  limit: number;
  /** Time window in seconds */
  window: number;
  /** Identifier type for rate limiting */
  identifier?: "ip" | "user" | "session";
}

/**
 * HTTP methods
 */
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS";

/**
 * Route configuration
 */
export interface RouteConfig {
  /** Allowed HTTP methods */
  methods: HttpMethod[];
  /** Require authentication */
  auth?: boolean;
  /** Rate limit configuration */
  rateLimit?: RateLimitConfig;
}
