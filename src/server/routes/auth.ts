/**
 * Authentication Routes
 *
 * Delegates to Better Auth handler for all auth operations.
 */

import { Hono } from "hono";
import { auth } from "@/lib/auth";

const authRoutes = new Hono();

// Handle all auth routes with Better Auth
authRoutes.all("/*", async (c) => {
  return auth.handler(c.req.raw);
});

export { authRoutes };
