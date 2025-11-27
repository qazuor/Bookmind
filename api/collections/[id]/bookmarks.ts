/**
 * Collections API - Bookmark Management
 *
 * POST /api/collections/:id/bookmarks - Add bookmarks to collection
 * DELETE /api/collections/:id/bookmarks - Remove bookmarks from collection
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
  addBookmarksToCollection,
  getCollectionById,
  removeBookmarksFromCollection,
} from "../../../src/lib/services/collections";
import { collectionBookmarksSchema } from "../../../src/schemas/collection.schema";

/**
 * POST /api/collections/:id/bookmarks
 * Add bookmarks to a collection
 */
async function handlePost(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
  collectionId: string,
): Promise<void> {
  // Validate request body
  const result = collectionBookmarksSchema.safeParse(req.body);
  if (!result.success) {
    sendError(
      res,
      new BadRequestError("Invalid request data", {
        errors: result.error.issues,
      }),
    );
    return;
  }

  // Check if collection exists
  const collection = await getCollectionById(collectionId, req.userId);
  if (!collection) {
    sendError(res, new NotFoundError("Collection"));
    return;
  }

  const addedCount = await addBookmarksToCollection(
    collectionId,
    req.userId,
    result.data.bookmarkIds,
  );

  sendSuccess(res, { added: addedCount }, 200);
}

/**
 * DELETE /api/collections/:id/bookmarks
 * Remove bookmarks from a collection
 */
async function handleDelete(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
  collectionId: string,
): Promise<void> {
  // Validate request body
  const result = collectionBookmarksSchema.safeParse(req.body);
  if (!result.success) {
    sendError(
      res,
      new BadRequestError("Invalid request data", {
        errors: result.error.issues,
      }),
    );
    return;
  }

  // Check if collection exists
  const collection = await getCollectionById(collectionId, req.userId);
  if (!collection) {
    sendError(res, new NotFoundError("Collection"));
    return;
  }

  const removedCount = await removeBookmarksFromCollection(
    collectionId,
    req.userId,
    result.data.bookmarkIds,
  );

  sendSuccess(res, { removed: removedCount }, 200);
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
    sendError(res, new BadRequestError("Collection ID is required"));
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
