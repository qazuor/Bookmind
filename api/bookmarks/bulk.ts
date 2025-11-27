/**
 * Bookmarks API - Bulk Operations
 *
 * POST /api/bookmarks/bulk/delete - Delete multiple bookmarks
 * POST /api/bookmarks/bulk/archive - Archive multiple bookmarks
 * POST /api/bookmarks/bulk/unarchive - Unarchive multiple bookmarks
 * POST /api/bookmarks/bulk/move - Move multiple bookmarks to category
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { withAuth } from "../../src/lib/api/auth";
import {
  BadRequestError,
  sendError,
  sendSuccess,
} from "../../src/lib/api/errors";
import { withErrorHandler, withRateLimit } from "../../src/lib/api/index";
import type { ApiRequest } from "../../src/lib/api/types";
import {
  bulkArchiveBookmarks,
  bulkDeleteBookmarks,
  bulkMoveToCategory,
} from "../../src/lib/services/bookmarks";

const bulkIdsSchema = z.object({
  bookmarkIds: z
    .array(z.string().uuid("Invalid bookmark ID"))
    .min(1, "At least one bookmark ID is required")
    .max(100, "Maximum 100 bookmarks per operation"),
});

const bulkMoveSchema = bulkIdsSchema.extend({
  categoryId: z.string().uuid("Invalid category ID").nullable(),
});

/**
 * POST /api/bookmarks/bulk
 * Handle bulk operations
 */
async function handlePost(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
): Promise<void> {
  const { action } = req.query;

  switch (action) {
    case "delete":
      return handleBulkDelete(req, res);
    case "archive":
      return handleBulkArchive(req, res, true);
    case "unarchive":
      return handleBulkArchive(req, res, false);
    case "move":
      return handleBulkMove(req, res);
    default:
      sendError(
        res,
        new BadRequestError(
          "Invalid action. Use: delete, archive, unarchive, or move",
        ),
      );
  }
}

/**
 * Delete multiple bookmarks
 */
async function handleBulkDelete(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
): Promise<void> {
  const result = bulkIdsSchema.safeParse(req.body);
  if (!result.success) {
    sendError(
      res,
      new BadRequestError("Invalid request data", {
        errors: result.error.issues,
      }),
    );
    return;
  }

  const count = await bulkDeleteBookmarks(req.userId, result.data.bookmarkIds);

  sendSuccess(res, { deleted: count }, 200);
}

/**
 * Archive/unarchive multiple bookmarks
 */
async function handleBulkArchive(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
  archived: boolean,
): Promise<void> {
  const result = bulkIdsSchema.safeParse(req.body);
  if (!result.success) {
    sendError(
      res,
      new BadRequestError("Invalid request data", {
        errors: result.error.issues,
      }),
    );
    return;
  }

  const count = await bulkArchiveBookmarks(
    req.userId,
    result.data.bookmarkIds,
    archived,
  );

  sendSuccess(res, { updated: count, archived }, 200);
}

/**
 * Move multiple bookmarks to a category
 */
async function handleBulkMove(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
): Promise<void> {
  const result = bulkMoveSchema.safeParse(req.body);
  if (!result.success) {
    sendError(
      res,
      new BadRequestError("Invalid request data", {
        errors: result.error.issues,
      }),
    );
    return;
  }

  const count = await bulkMoveToCategory(
    req.userId,
    result.data.bookmarkIds,
    result.data.categoryId,
  );

  sendSuccess(res, { updated: count, categoryId: result.data.categoryId }, 200);
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
      case "POST":
        return handlePost(authReq, authRes);
      default:
        authRes.setHeader("Allow", "POST");
        authRes.status(405).json({ error: "Method not allowed" });
    }
  });

  return authHandler(req as ApiRequest, res);
}

export default withErrorHandler(withRateLimit("api", handler));
