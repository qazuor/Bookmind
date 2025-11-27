/**
 * Bot Protection Middleware (P3-003)
 *
 * Multiple layers of bot detection:
 * - Honeypot field checking
 * - Request timing analysis
 * - User-Agent validation
 * - Suspicious pattern detection
 */

import type { VercelResponse } from "@vercel/node";
import { ForbiddenError, sendError } from "../errors";
import type { ApiRequest } from "../types";

/**
 * Known bot user agents (partial matches)
 */
const BOT_USER_AGENTS = [
  "bot",
  "crawler",
  "spider",
  "scraper",
  "curl",
  "wget",
  "python-requests",
  "go-http-client",
  "java",
  "perl",
  "ruby",
  "php",
  "httpclient",
  "axios",
  "node-fetch",
  "undici",
];

/**
 * Suspicious user agents that need extra scrutiny
 */
const SUSPICIOUS_PATTERNS = [
  /^$/,
  /^-$/,
  /^\s+$/,
  /^Mozilla\/[45]\.0$/,
  /headless/i,
  /phantom/i,
  /selenium/i,
  /puppeteer/i,
  /playwright/i,
];

/**
 * Minimum time (ms) expected for human form submission
 */
const MIN_SUBMISSION_TIME = 1000;

/**
 * Honeypot field names to check
 */
const HONEYPOT_FIELDS = ["website", "url", "link", "homepage", "fax"];

interface BotProtectionConfig {
  /** Check honeypot fields in request body */
  checkHoneypot?: boolean;
  /** Minimum time for form submission (ms) */
  minSubmissionTime?: number;
  /** Check user agent */
  checkUserAgent?: boolean;
  /** Timestamp field name in request body */
  timestampField?: string;
  /** Allow requests without user agent */
  allowEmptyUserAgent?: boolean;
}

const DEFAULT_CONFIG: BotProtectionConfig = {
  checkHoneypot: true,
  minSubmissionTime: MIN_SUBMISSION_TIME,
  checkUserAgent: true,
  timestampField: "_timestamp",
  allowEmptyUserAgent: false,
};

/**
 * Check if user agent looks like a bot
 */
function isBotUserAgent(userAgent: string | undefined): boolean {
  if (!userAgent) return true;

  const ua = userAgent.toLowerCase();

  // Check against known bot patterns
  for (const bot of BOT_USER_AGENTS) {
    if (ua.includes(bot)) {
      return true;
    }
  }

  // Check suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(userAgent)) {
      return true;
    }
  }

  return false;
}

/**
 * Check honeypot fields in request body
 */
function hasFilledHoneypot(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;

  const record = body as Record<string, unknown>;

  for (const field of HONEYPOT_FIELDS) {
    const value = record[field];
    if (value && typeof value === "string" && value.length > 0) {
      return true;
    }
  }

  return false;
}

/**
 * Check if form was submitted too quickly
 */
function isSubmittedTooFast(
  body: unknown,
  timestampField: string,
  minTime: number,
): boolean {
  if (!body || typeof body !== "object") return false;

  const record = body as Record<string, unknown>;
  const timestamp = record[timestampField];

  if (!timestamp || typeof timestamp !== "number") return false;

  const elapsed = Date.now() - timestamp;
  return elapsed < minTime;
}

/**
 * Log suspicious activity (for monitoring)
 */
function logSuspiciousActivity(
  req: ApiRequest,
  reason: string,
  details?: Record<string, unknown>,
): void {
  const log = {
    type: "bot_detected",
    reason,
    ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress,
    userAgent: req.headers["user-agent"],
    path: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...details,
  };

  console.warn("[Bot Protection]", JSON.stringify(log));
}

/**
 * Bot protection middleware
 *
 * @example
 * ```ts
 * // Basic usage
 * export default withBotProtection(async (req, res) => {
 *   // Handler code
 * });
 *
 * // With custom config
 * export default withBotProtection({
 *   checkHoneypot: true,
 *   minSubmissionTime: 2000,
 * }, async (req, res) => {
 *   // Handler code
 * });
 * ```
 */
export function withBotProtection<TBody = unknown, TQuery = unknown>(
  configOrHandler:
    | BotProtectionConfig
    | ((
        req: ApiRequest<TBody, TQuery>,
        res: VercelResponse,
      ) => Promise<void | VercelResponse>),
  maybeHandler?: (
    req: ApiRequest<TBody, TQuery>,
    res: VercelResponse,
  ) => Promise<void | VercelResponse>,
) {
  const config: BotProtectionConfig =
    typeof configOrHandler === "function"
      ? DEFAULT_CONFIG
      : { ...DEFAULT_CONFIG, ...configOrHandler };
  const handler =
    typeof configOrHandler === "function" ? configOrHandler : maybeHandler!;

  return async (
    req: ApiRequest<TBody, TQuery>,
    res: VercelResponse,
  ): Promise<void | VercelResponse> => {
    const userAgent = req.headers["user-agent"];
    const baseReq = req as ApiRequest;

    // Check user agent
    if (config.checkUserAgent) {
      if (!(userAgent || config.allowEmptyUserAgent)) {
        logSuspiciousActivity(baseReq, "empty_user_agent");
        const error = new ForbiddenError("Invalid request");
        return sendError(res, error);
      }

      if (userAgent && isBotUserAgent(userAgent)) {
        logSuspiciousActivity(baseReq, "bot_user_agent", { userAgent });
        const error = new ForbiddenError("Invalid request");
        return sendError(res, error);
      }
    }

    // Only check body-related protections for POST/PUT/PATCH
    if (["POST", "PUT", "PATCH"].includes(req.method || "")) {
      // Check honeypot fields
      if (config.checkHoneypot && hasFilledHoneypot(req.body)) {
        logSuspiciousActivity(baseReq, "honeypot_filled");
        // Silently succeed for bots (they think submission worked)
        return res.status(200).json({ success: true });
      }

      // Check submission timing
      if (
        config.minSubmissionTime &&
        config.timestampField &&
        isSubmittedTooFast(
          req.body,
          config.timestampField,
          config.minSubmissionTime,
        )
      ) {
        logSuspiciousActivity(baseReq, "submitted_too_fast");
        const error = new ForbiddenError("Please try again");
        return sendError(res, error);
      }
    }

    return handler(req, res);
  };
}

/**
 * Check if request is from a bot (utility function)
 */
export function isBot(req: ApiRequest): boolean {
  const userAgent = req.headers["user-agent"];
  return isBotUserAgent(userAgent);
}

/**
 * Generate a timestamp for honeypot timing check
 */
export function generateFormTimestamp(): number {
  return Date.now();
}
