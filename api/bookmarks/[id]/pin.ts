/**
 * Bookmarks API - Pin Operations
 *
 * POST /api/bookmarks/:id/pin - Pin a bookmark
 * DELETE /api/bookmarks/:id/pin - Unpin a bookmark
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withAuth } from "../../../src/lib/api/auth";
import {
  BadRequestError,
  NotFoundError,
  sendError,
  sendSuccess,
} from "../../../src/lib/api/errors";
import { withErrorHandler, withRateLimit } from "../../../src/lib/api/index";
import type { ApiRequest } from "../../../src/lib/api/types";
import {
  bookmarkExists,
  pinBookmark,
} from "../../../src/lib/services/bookmarks";

/**
 * POST /api/bookmarks/:id/pin
 * Pin a bookmark
 */
async function handlePost(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
  bookmarkId: string,
): Promise<void> {
  // Check if bookmark exists
  const exists = await bookmarkExists(bookmarkId, req.userId);
  if (!exists) {
    sendError(res, new NotFoundError("Bookmark"));
    return;
  }

  const bookmark = await pinBookmark(bookmarkId, req.userId, true);

  if (!bookmark) {
    sendError(res, new NotFoundError("Bookmark"));
    return;
  }

  sendSuccess(res, { pinned: true }, 200);
}

/**
 * DELETE /api/bookmarks/:id/pin
 * Unpin a bookmark
 */
async function handleDelete(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
  bookmarkId: string,
): Promise<void> {
  // Check if bookmark exists
  const exists = await bookmarkExists(bookmarkId, req.userId);
  if (!exists) {
    sendError(res, new NotFoundError("Bookmark"));
    return;
  }

  const bookmark = await pinBookmark(bookmarkId, req.userId, false);

  if (!bookmark) {
    sendError(res, new NotFoundError("Bookmark"));
    return;
  }

  sendSuccess(res, { pinned: false }, 200);
}

/**
 * Main handler
 */
async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void | VercelResponse> {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    sendError(res, new BadRequestError("Bookmark ID is required"));
    return;
  }

  const authHandler = withAuth(async (authReq, authRes) => {
    switch (authReq.method) {
      case "POST":
        return handlePost(authReq, authRes, id);
      case "DELETE":
        return handleDelete(authReq, authRes, id);
      default:
        authRes.setHeader("Allow", "POST, DELETE");
        authRes.status(405).json({ error: "Method not allowed" });
    }
  });

  return authHandler(req as ApiRequest, res);
}

export default withErrorHandler(withRateLimit("api", handler));
