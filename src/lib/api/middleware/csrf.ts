/**
 * CSRF Protection Middleware (P3-004)
 *
 * Token generation and validation for cross-site request forgery protection.
 * Uses the double-submit cookie pattern.
 */

import crypto from "node:crypto";
import type { VercelResponse } from "@vercel/node";
import { ForbiddenError, sendError } from "../errors";
import type { ApiRequest } from "../types";

/**
 * CSRF token configuration
 */
interface CsrfConfig {
  /** Cookie name for CSRF token */
  cookieName?: string;
  /** Header name for CSRF token */
  headerName?: string;
  /** Token length in bytes */
  tokenLength?: number;
  /** Cookie options */
  cookieOptions?: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
    path?: string;
    maxAge?: number;
  };
  /** Methods that require CSRF validation */
  protectedMethods?: string[];
  /** Paths to exclude from CSRF validation */
  excludePaths?: string[];
}

const DEFAULT_CONFIG: Required<CsrfConfig> = {
  cookieName: "__csrf",
  headerName: "x-csrf-token",
  tokenLength: 32,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  },
  protectedMethods: ["POST", "PUT", "PATCH", "DELETE"],
  excludePaths: ["/api/auth"],
};

/**
 * Generate a secure random CSRF token
 */
export function generateCsrfToken(length = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Parse cookies from request
 */
function parseCookies(req: ApiRequest): Record<string, string> {
  const cookies: Record<string, string> = {};
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) return cookies;

  for (const cookie of cookieHeader.split(";")) {
    const [name, ...rest] = cookie.trim().split("=");
    if (name && rest.length > 0) {
      cookies[name] = rest.join("=");
    }
  }

  return cookies;
}

/**
 * Set CSRF cookie
 */
function setCsrfCookie(
  res: VercelResponse,
  token: string,
  config: Required<CsrfConfig>,
): void {
  const { cookieName, cookieOptions } = config;
  const parts = [`${cookieName}=${token}`];

  if (cookieOptions.httpOnly) parts.push("HttpOnly");
  if (cookieOptions.secure) parts.push("Secure");
  if (cookieOptions.sameSite) parts.push(`SameSite=${cookieOptions.sameSite}`);
  if (cookieOptions.path) parts.push(`Path=${cookieOptions.path}`);
  if (cookieOptions.maxAge) parts.push(`Max-Age=${cookieOptions.maxAge}`);

  res.setHeader("Set-Cookie", parts.join("; "));
}

/**
 * Validate CSRF token using timing-safe comparison
 */
function validateToken(expected: string, actual: string): boolean {
  if (expected.length !== actual.length) return false;

  try {
    const expectedBuf = new Uint8Array(Buffer.from(expected));
    const actualBuf = new Uint8Array(Buffer.from(actual));
    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  } catch {
    return false;
  }
}

/**
 * Check if path should be excluded from CSRF protection
 */
function isExcludedPath(path: string, excludePaths: string[]): boolean {
  for (const excluded of excludePaths) {
    if (path.startsWith(excluded)) {
      return true;
    }
  }
  return false;
}

/**
 * CSRF protection middleware
 *
 * @example
 * ```ts
 * export default withCsrf(async (req, res) => {
 *   // Handler code - CSRF validated
 * });
 * ```
 */
export function withCsrf<TBody = unknown, TQuery = unknown>(
  configOrHandler:
    | CsrfConfig
    | ((
        req: ApiRequest<TBody, TQuery>,
        res: VercelResponse,
      ) => Promise<void | VercelResponse>),
  maybeHandler?: (
    req: ApiRequest<TBody, TQuery>,
    res: VercelResponse,
  ) => Promise<void | VercelResponse>,
) {
  const config: Required<CsrfConfig> =
    typeof configOrHandler === "function"
      ? DEFAULT_CONFIG
      : { ...DEFAULT_CONFIG, ...configOrHandler };
  const handler =
    typeof configOrHandler === "function" ? configOrHandler : maybeHandler!;

  return async (
    req: ApiRequest<TBody, TQuery>,
    res: VercelResponse,
  ): Promise<void | VercelResponse> => {
    const method = req.method || "GET";
    const path = req.url || "";
    const baseReq = req as ApiRequest;

    // Skip CSRF for excluded paths
    if (isExcludedPath(path, config.excludePaths)) {
      return handler(req, res);
    }

    // For GET requests, just ensure token exists in cookie
    if (!config.protectedMethods.includes(method)) {
      const cookies = parseCookies(baseReq);
      if (!cookies[config.cookieName]) {
        const token = generateCsrfToken(config.tokenLength);
        setCsrfCookie(res, token, config);
      }
      return handler(req, res);
    }

    // For protected methods, validate token
    const cookies = parseCookies(baseReq);
    const cookieToken = cookies[config.cookieName];
    const headerToken = req.headers[config.headerName] as string | undefined;

    // Both tokens must exist
    if (!(cookieToken && headerToken)) {
      const error = new ForbiddenError("CSRF token missing");
      return sendError(res, error);
    }

    // Tokens must match
    if (!validateToken(cookieToken, headerToken)) {
      const error = new ForbiddenError("CSRF token invalid");
      return sendError(res, error);
    }

    // Generate new token after successful validation (token rotation)
    const newToken = generateCsrfToken(config.tokenLength);
    setCsrfCookie(res, newToken, config);

    return handler(req, res);
  };
}

/**
 * Get CSRF token for client
 *
 * Use this to get a token to include in requests
 */
export function getCsrfToken(
  req: ApiRequest,
  config?: CsrfConfig,
): string | null {
  const { cookieName } = { ...DEFAULT_CONFIG, ...config };
  const cookies = parseCookies(req);
  return cookies[cookieName] || null;
}

/**
 * Create a CSRF token endpoint handler
 *
 * @example
 * ```ts
 * // api/csrf-token.ts
 * export default csrfTokenHandler();
 * ```
 */
export function csrfTokenHandler(config?: CsrfConfig) {
  const mergedConfig: Required<CsrfConfig> = { ...DEFAULT_CONFIG, ...config };

  return async (req: ApiRequest, res: VercelResponse): Promise<void> => {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const token = generateCsrfToken(mergedConfig.tokenLength);
    setCsrfCookie(res, token, mergedConfig);

    res.status(200).json({ token });
  };
}
