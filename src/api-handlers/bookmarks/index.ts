/**
 * Bookmarks API - List and Create
 *
 * GET /api/bookmarks - List user's bookmarks with filters
 * POST /api/bookmarks - Create a new bookmark
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withAuth } from "../../src/lib/api/auth";
import {
  BadRequestError,
  ConflictError,
  sendError,
  sendSuccess,
} from "../../src/lib/api/errors";
import { withErrorHandler, withRateLimit } from "../../src/lib/api/index";
import type { ApiRequest } from "../../src/lib/api/types";
import {
  createBookmark,
  getBookmarkByUrl,
  getBookmarks,
} from "../../src/lib/services/bookmarks";
import {
  createBookmarkSchema,
  listBookmarksSchema,
} from "../../src/schemas/bookmark.schema";

/**
 * GET /api/bookmarks
 * List bookmarks with optional filters and pagination
 */
async function handleGet(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
): Promise<void> {
  // Parse query params
  const queryInput = {
    page: req.query.page,
    limit: req.query.limit,
    sortBy: req.query.sortBy,
    sortOrder: req.query.sortOrder,
    categoryId: req.query.categoryId,
    collectionId: req.query.collectionId,
    isPublic:
      req.query.isPublic === "true"
        ? true
        : req.query.isPublic === "false"
          ? false
          : undefined,
    isArchived:
      req.query.isArchived === "true"
        ? true
        : req.query.isArchived === "false"
          ? false
          : undefined,
    isPinned:
      req.query.isPinned === "true"
        ? true
        : req.query.isPinned === "false"
          ? false
          : undefined,
    search: req.query.search,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    tagIds: req.query.tagIds
      ? Array.isArray(req.query.tagIds)
        ? req.query.tagIds
        : [req.query.tagIds]
      : undefined,
  };

  const result = listBookmarksSchema.safeParse(queryInput);
  if (!result.success) {
    sendError(
      res,
      new BadRequestError("Invalid query parameters", {
        errors: result.error.issues,
      }),
    );
    return;
  }

  const bookmarks = await getBookmarks(req.userId, result.data);

  sendSuccess(res, bookmarks);
}

/**
 * POST /api/bookmarks
 * Create a new bookmark
 */
async function handlePost(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
): Promise<void> {
  // Validate request body
  const result = createBookmarkSchema.safeParse(req.body);
  if (!result.success) {
    sendError(
      res,
      new BadRequestError("Invalid bookmark data", {
        errors: result.error.issues,
      }),
    );
    return;
  }

  // Check for duplicate URL
  const existing = await getBookmarkByUrl(result.data.url, req.userId);
  if (existing) {
    sendError(
      res,
      new ConflictError("Bookmark with this URL already exists", {
        existingBookmarkId: existing.id,
      }),
    );
    return;
  }

  const bookmark = await createBookmark(req.userId, result.data);

  sendSuccess(res, bookmark, 201);
}

/**
 * Main handler
 */
async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void | VercelResponse> {
  const authHandler = withAuth(async (authReq, authRes) => {
    switch (authReq.method) {
      case "GET":
        return handleGet(authReq, authRes);
      case "POST":
        return handlePost(authReq, authRes);
      default:
        authRes.setHeader("Allow", "GET, POST");
        authRes.status(405).json({ error: "Method not allowed" });
    }
  });

  return authHandler(req as ApiRequest, res);
}

export default withErrorHandler(withRateLimit("api", handler));
