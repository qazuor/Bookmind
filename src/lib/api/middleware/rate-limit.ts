/**
 * Rate Limiting Middleware (P3-002)
 *
 * Uses Upstash Redis for distributed rate limiting.
 * Different limits for auth, api, and ai endpoints.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { VercelResponse } from "@vercel/node";
import { RateLimitError, sendError } from "../errors";
import type { ApiRequest, RateLimitConfig } from "../types";

// Redis client singleton
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!(url && token)) {
    console.warn(
      "[Rate Limit] Upstash Redis not configured, rate limiting disabled",
    );
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

// Rate limiters cache
const limiters = new Map<string, Ratelimit>();

/**
 * Get or create a rate limiter
 */
function getRateLimiter(
  prefix: string,
  config: RateLimitConfig,
): Ratelimit | null {
  const client = getRedis();
  if (!client) return null;

  const key = `${prefix}:${config.limit}:${config.window}`;

  if (!limiters.has(key)) {
    limiters.set(
      key,
      new Ratelimit({
        redis: client,
        limiter: Ratelimit.slidingWindow(config.limit, `${config.window} s`),
        prefix: `ratelimit:${prefix}`,
        analytics: true,
      }),
    );
  }

  return limiters.get(key) || null;
}

/**
 * Get identifier for rate limiting
 */
function getIdentifier(
  req: ApiRequest,
  type: RateLimitConfig["identifier"],
): string {
  switch (type) {
    case "user":
      return req.userId || getIpAddress(req);
    case "session":
      return req.sessionId || getIpAddress(req);
    default:
      return getIpAddress(req);
  }
}

/**
 * Extract IP address from request
 */
function getIpAddress(req: ApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  if (Array.isArray(forwarded)) {
    return forwarded[0] || "unknown";
  }
  return (
    (req.headers["x-real-ip"] as string) ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

/**
 * Predefined rate limit configurations
 */
export const RATE_LIMITS = {
  /** Authentication endpoints: 10 requests per minute */
  auth: { limit: 10, window: 60, identifier: "ip" as const },
  /** Standard API endpoints: 100 requests per minute */
  api: { limit: 100, window: 60, identifier: "user" as const },
  /** AI endpoints: 20 requests per minute */
  ai: { limit: 20, window: 60, identifier: "user" as const },
  /** Search endpoints: 60 requests per minute */
  search: { limit: 60, window: 60, identifier: "user" as const },
  /** Export endpoints: 5 requests per minute */
  export: { limit: 5, window: 60, identifier: "user" as const },
  /** Public endpoints: 30 requests per minute */
  public: { limit: 30, window: 60, identifier: "ip" as const },
} as const;

export type RateLimitType = keyof typeof RATE_LIMITS;

/**
 * Rate limit middleware
 *
 * @example
 * ```ts
 * export default withRateLimit("api", async (req, res) => {
 *   // Handler code
 * });
 * ```
 */
export function withRateLimit<TBody = unknown, TQuery = unknown>(
  type: RateLimitType | RateLimitConfig,
  handler: (
    req: ApiRequest<TBody, TQuery>,
    res: VercelResponse,
  ) => Promise<void | VercelResponse>,
) {
  const config: RateLimitConfig =
    typeof type === "string" ? RATE_LIMITS[type] : type;

  return async (
    req: ApiRequest<TBody, TQuery>,
    res: VercelResponse,
  ): Promise<void | VercelResponse> => {
    const limiter = getRateLimiter(
      typeof type === "string" ? type : "custom",
      config,
    );
    const baseReq = req as ApiRequest;

    // Skip rate limiting if Redis not configured
    if (!limiter) {
      return handler(req, res);
    }

    const identifier = getIdentifier(baseReq, config.identifier);
    const { success, limit, remaining, reset } =
      await limiter.limit(identifier);

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", limit.toString());
    res.setHeader("X-RateLimit-Remaining", remaining.toString());
    res.setHeader("X-RateLimit-Reset", reset.toString());

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      const error = new RateLimitError(retryAfter > 0 ? retryAfter : 1);
      return sendError(res, error);
    }

    return handler(req, res);
  };
}

/**
 * Check rate limit without middleware
 *
 * @returns true if request is allowed, false if rate limited
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType | RateLimitConfig,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const config: RateLimitConfig =
    typeof type === "string" ? RATE_LIMITS[type] : type;
  const limiter = getRateLimiter(
    typeof type === "string" ? type : "custom",
    config,
  );

  if (!limiter) {
    return {
      allowed: true,
      remaining: config.limit,
      resetAt: Date.now() + config.window * 1000,
    };
  }

  const { success, remaining, reset } = await limiter.limit(identifier);

  return {
    allowed: success,
    remaining,
    resetAt: reset,
  };
}
