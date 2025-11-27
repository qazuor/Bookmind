/**
 * API Authentication Utilities
 *
 * Helpers for authenticating API requests using Better Auth.
 */

import type { VercelResponse } from "@vercel/node";
import { auth } from "../auth";
import { sendError, UnauthorizedError } from "./errors";
import type { ApiRequest } from "./types";

/**
 * Session with user information
 */
export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  };
  session: {
    id: string;
    expiresAt: Date;
  };
}

/**
 * Convert IncomingHttpHeaders to Headers
 */
function convertHeaders(headers: ApiRequest["headers"]): Headers {
  const h = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    if (value) {
      h.set(key, Array.isArray(value) ? value.join(", ") : value);
    }
  }
  return h;
}

/**
 * Get the current session from the request
 * Returns null if not authenticated
 */
export async function getSession(req: ApiRequest): Promise<AuthSession | null> {
  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: convertHeaders(req.headers),
    });

    if (!session?.user) {
      return null;
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
      },
      session: {
        id: session.session.id,
        expiresAt: session.session.expiresAt,
      },
    };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Intentional error logging for auth failures
    console.error("[Auth] Failed to get session:", error);
    return null;
  }
}

/**
 * Get the current user ID from the request
 * Returns null if not authenticated
 */
export async function getUserId(req: ApiRequest): Promise<string | null> {
  const session = await getSession(req);
  return session?.user.id ?? null;
}

/**
 * Require authentication middleware
 * Adds userId to the request if authenticated, returns 401 if not
 */
export function withAuth<TBody = unknown, TQuery = unknown>(
  handler: (
    req: ApiRequest<TBody, TQuery> & { userId: string },
    res: VercelResponse,
  ) => Promise<void | VercelResponse>,
) {
  return async (
    req: ApiRequest,
    res: VercelResponse,
  ): Promise<void | VercelResponse> => {
    const userId = await getUserId(req);

    if (!userId) {
      const error = new UnauthorizedError("Authentication required");
      return sendError(res, error);
    }

    // Add userId to request
    const authReq = req as ApiRequest<TBody, TQuery> & { userId: string };
    authReq.userId = userId;

    return handler(authReq, res);
  };
}

/**
 * Optional authentication - adds userId if authenticated but doesn't require it
 */
export function withOptionalAuth<TBody = unknown, TQuery = unknown>(
  handler: (
    req: ApiRequest<TBody, TQuery> & { userId: string | null },
    res: VercelResponse,
  ) => Promise<void | VercelResponse>,
) {
  return async (
    req: ApiRequest,
    res: VercelResponse,
  ): Promise<void | VercelResponse> => {
    const userId = await getUserId(req);

    // Add userId to request (may be null)
    // biome-ignore lint/suspicious/noExplicitAny: userId can be null for optional auth
    (req as any).userId = userId;

    return handler(
      req as ApiRequest<TBody, TQuery> & { userId: string | null },
      res,
    );
  };
}
