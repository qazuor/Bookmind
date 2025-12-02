/**
 * Authentication Middleware
 *
 * Validates user session and attaches user info to context.
 */

import type { Context, Next } from "hono";
import { auth } from "@/lib/auth";

// Extend Hono context with user
declare module "hono" {
  interface ContextVariableMap {
    userId: string;
    user: {
      id: string;
      email: string;
      name: string | null;
    };
  }
}

/**
 * Require authentication middleware
 * Returns 401 if no valid session
 */
export async function requireAuth(c: Context, next: Next) {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session?.user?.id) {
      return c.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        401,
      );
    }

    c.set("userId", session.user.id);
    c.set("user", {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    });

    await next();
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Auth error logging is necessary
    console.error("[Auth] Session verification error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      },
      401,
    );
  }
}

/**
 * Optional authentication middleware
 * Attaches user if session exists, but doesn't block
 */
export async function optionalAuth(c: Context, next: Next) {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (session?.user?.id) {
      c.set("userId", session.user.id);
      c.set("user", {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      });
    }
  } catch {
    // Ignore errors - user just won't be authenticated
  }

  await next();
}
