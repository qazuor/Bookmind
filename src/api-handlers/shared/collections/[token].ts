/**
 * Shared Collections API - Public Access
 *
 * GET /api/shared/collections/:token - Get shared collection details
 * GET /api/shared/collections/:token?bookmarks=true - Include bookmarks
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  BadRequestError,
  NotFoundError,
  sendError,
  sendSuccess,
} from "../../../src/lib/api/errors";
import { withErrorHandler, withRateLimit } from "../../../src/lib/api/index";
import {
  getSharedCollection,
  getSharedCollectionBookmarks,
} from "../../../src/lib/services/collections";

/**
 * GET /api/shared/collections/:token
 * Get a shared collection (public access, no auth required)
 */
async function handleGet(
  req: VercelRequest,
  res: VercelResponse,
  shareToken: string,
): Promise<void> {
  const shared = await getSharedCollection(shareToken);

  if (!shared) {
    sendError(res, new NotFoundError("Shared collection not found or expired"));
    return;
  }

  const { bookmarks: includeBookmarks, limit, offset } = req.query;

  // Base response
  const response: {
    id: string;
    name: string;
    description: string | null;
    bookmarkCount: number;
    owner: {
      username: string;
      name: string | null;
      avatarUrl: string | null;
    };
    bookmarks?: {
      id: string;
      url: string;
      title: string;
      description: string | null;
      favicon: string | null;
      ogImage: string | null;
    }[];
  } = {
    id: shared.collection.id,
    name: shared.collection.name,
    description: shared.collection.description,
    bookmarkCount: shared.bookmarkCount,
    owner: {
      username: shared.owner.username,
      name: shared.owner.name,
      avatarUrl: shared.owner.avatarUrl,
    },
  };

  // Include bookmarks if requested
  if (includeBookmarks === "true") {
    const parsedLimit = limit ? Number.parseInt(limit as string, 10) : 50;
    const parsedOffset = offset ? Number.parseInt(offset as string, 10) : 0;

    response.bookmarks = await getSharedCollectionBookmarks(
      shareToken,
      Math.min(parsedLimit, 100), // Cap at 100
      Math.max(parsedOffset, 0),
    );
  }

  sendSuccess(res, response);
}

/**
 * Main handler
 */
async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void | VercelResponse> {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    sendError(res, new BadRequestError("Share token is required"));
    return;
  }

  switch (req.method) {
    case "GET":
      return handleGet(req, res, token);
    default:
      res.setHeader("Allow", "GET");
      res.status(405).json({ error: "Method not allowed" });
  }
}

export default withErrorHandler(withRateLimit("api", handler));
