/**
 * Better Auth API Handler
 *
 * Handles all authentication routes:
 * - POST /api/auth/sign-up
 * - POST /api/auth/sign-in/email
 * - POST /api/auth/sign-out
 * - GET /api/auth/session
 * - GET /api/auth/sign-in/social (Google, GitHub)
 * - GET /api/auth/callback/:provider
 * - POST /api/auth/forget-password
 * - POST /api/auth/reset-password
 * - POST /api/auth/verify-email
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../../src/lib/auth";

// Convert Better Auth handler to Node.js compatible handler
const handler = toNodeHandler(auth);

export default async function (req: VercelRequest, res: VercelResponse) {
  // Handle the request with Better Auth
  return handler(req, res);
}
