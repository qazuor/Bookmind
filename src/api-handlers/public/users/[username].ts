/**
 * Public Users API
 *
 * GET /api/public/users/:username - Get public user profile
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  BadRequestError,
  NotFoundError,
  sendError,
  sendSuccess,
} from "../../../src/lib/api/errors";
import { withErrorHandler, withRateLimit } from "../../../src/lib/api/index";
import { getPublicUserProfile } from "../../../src/lib/services/users";

/**
 * GET /api/public/users/:username
 * Get public user profile
 */
async function handleGet(
  _req: VercelRequest,
  res: VercelResponse,
  username: string,
): Promise<void> {
  const profile = await getPublicUserProfile(username);

  if (!profile) {
    sendError(res, new NotFoundError("User"));
    return;
  }

  sendSuccess(res, profile);
}

/**
 * Main handler
 */
async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void | VercelResponse> {
  const { username } = req.query;

  if (!username || typeof username !== "string") {
    sendError(res, new BadRequestError("Username is required"));
    return;
  }

  switch (req.method) {
    case "GET":
      return handleGet(req, res, username);
    default:
      res.setHeader("Allow", "GET");
      res.status(405).json({ error: "Method not allowed" });
  }
}

export default withErrorHandler(withRateLimit("public", handler));
