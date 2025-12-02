/**
 * Search API
 *
 * GET /api/search - Search bookmarks with text query
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withAuth } from "../../src/lib/api/auth";
import {
  BadRequestError,
  sendError,
  sendSuccess,
} from "../../src/lib/api/errors";
import { withErrorHandler, withRateLimit } from "../../src/lib/api/index";
import type { ApiRequest } from "../../src/lib/api/types";
import { getBookmarks } from "../../src/lib/services/bookmarks";
import { searchQuerySchema } from "../../src/schemas/search.schema";

/**
 * GET /api/search
 * Search bookmarks with text query and filters
 */
async function handleGet(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
): Promise<void> {
  // Parse and validate query params
  const queryInput = {
    q: req.query.q,
    mode: req.query.mode ?? "text",
    categoryId: req.query.categoryId,
    collectionId: req.query.collectionId,
    tagIds: req.query.tagIds
      ? Array.isArray(req.query.tagIds)
        ? req.query.tagIds
        : [req.query.tagIds]
      : undefined,
    isArchived:
      req.query.isArchived === "true"
        ? true
        : req.query.isArchived === "false"
          ? false
          : undefined,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    page: req.query.page ?? "1",
    limit: req.query.limit ?? "20",
  };

  const result = searchQuerySchema.safeParse(queryInput);
  if (!result.success) {
    sendError(
      res,
      new BadRequestError("Invalid search parameters", {
        errors: result.error.issues,
      }),
    );
    return;
  }

  // Use the bookmarks service with search filter
  const bookmarks = await getBookmarks(req.userId, {
    search: result.data.q,
    categoryId: result.data.categoryId,
    collectionId: result.data.collectionId,
    tagIds: result.data.tagIds,
    isArchived: result.data.isArchived,
    startDate: result.data.startDate,
    endDate: result.data.endDate,
    page: result.data.page,
    limit: result.data.limit,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  sendSuccess(res, {
    query: result.data.q,
    mode: result.data.mode,
    ...bookmarks,
  });
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
      default:
        authRes.setHeader("Allow", "GET");
        authRes.status(405).json({ error: "Method not allowed" });
    }
  });

  return authHandler(req as ApiRequest, res);
}

export default withErrorHandler(withRateLimit("search", handler));
