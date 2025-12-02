/**
 * Bookmarks API - Single Bookmark Operations
 *
 * GET /api/bookmarks/:id - Get a single bookmark
 * PATCH /api/bookmarks/:id - Update a bookmark
 * DELETE /api/bookmarks/:id - Delete a bookmark
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withAuth } from "../../src/lib/api/auth";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  sendError,
  sendSuccess,
} from "../../src/lib/api/errors";
import { withErrorHandler, withRateLimit } from "../../src/lib/api/index";
import type { ApiRequest } from "../../src/lib/api/types";
import {
  deleteBookmark,
  getBookmarkById,
  getBookmarkByUrl,
  updateBookmark,
} from "../../src/lib/services/bookmarks";
import { updateBookmarkSchema } from "../../src/schemas/bookmark.schema";

/**
 * GET /api/bookmarks/:id
 * Get a single bookmark with relations
 */
async function handleGet(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
  bookmarkId: string,
): Promise<void> {
  const bookmark = await getBookmarkById(bookmarkId, req.userId);

  if (!bookmark) {
    sendError(res, new NotFoundError("Bookmark"));
    return;
  }

  sendSuccess(res, bookmark);
}

/**
 * PATCH /api/bookmarks/:id
 * Update a bookmark
 */
async function handlePatch(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
  bookmarkId: string,
): Promise<void> {
  // Validate request body
  const result = updateBookmarkSchema.safeParse(req.body);
  if (!result.success) {
    sendError(
      res,
      new BadRequestError("Invalid bookmark data", {
        errors: result.error.issues,
      }),
    );
    return;
  }

  // Check if bookmark exists
  const existing = await getBookmarkById(bookmarkId, req.userId);
  if (!existing) {
    sendError(res, new NotFoundError("Bookmark"));
    return;
  }

  // Check for duplicate URL if URL is being changed
  if (result.data.url && result.data.url !== existing.url) {
    const duplicate = await getBookmarkByUrl(result.data.url, req.userId);
    if (duplicate && duplicate.id !== bookmarkId) {
      sendError(
        res,
        new ConflictError("Bookmark with this URL already exists", {
          existingBookmarkId: duplicate.id,
        }),
      );
      return;
    }
  }

  const updated = await updateBookmark(bookmarkId, req.userId, result.data);

  sendSuccess(res, updated);
}

/**
 * DELETE /api/bookmarks/:id
 * Delete a bookmark
 */
async function handleDelete(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
  bookmarkId: string,
): Promise<void> {
  // Check if bookmark exists
  const existing = await getBookmarkById(bookmarkId, req.userId);
  if (!existing) {
    sendError(res, new NotFoundError("Bookmark"));
    return;
  }

  await deleteBookmark(bookmarkId, req.userId);

  sendSuccess(res, { deleted: true }, 200);
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
      case "GET":
        return handleGet(authReq, authRes, id);
      case "PATCH":
        return handlePatch(authReq, authRes, id);
      case "DELETE":
        return handleDelete(authReq, authRes, id);
      default:
        authRes.setHeader("Allow", "GET, PATCH, DELETE");
        authRes.status(405).json({ error: "Method not allowed" });
    }
  });

  return authHandler(req as ApiRequest, res);
}

export default withErrorHandler(withRateLimit("api", handler));
