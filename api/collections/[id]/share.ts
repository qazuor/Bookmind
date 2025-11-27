/**
 * Collections API - Share Management
 *
 * POST /api/collections/:id/share - Generate share link
 * DELETE /api/collections/:id/share - Revoke share link
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
  getCollectionById,
  shareCollection,
  unshareCollection,
} from "../../../src/lib/services/collections";
import { collectionShareSchema } from "../../../src/schemas/collection.schema";

/**
 * POST /api/collections/:id/share
 * Generate a share link for a collection
 */
async function handlePost(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
  collectionId: string,
): Promise<void> {
  // Validate request body (optional expiration)
  const result = collectionShareSchema.safeParse(req.body ?? {});
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

  const shareResult = await shareCollection(
    collectionId,
    req.userId,
    result.data,
  );

  if (!shareResult) {
    sendError(res, new NotFoundError("Collection"));
    return;
  }

  sendSuccess(
    res,
    {
      shareToken: shareResult.shareToken,
      shareUrl: `/shared/collections/${shareResult.shareToken}`,
      expiresAt: shareResult.shareExpiresAt,
    },
    200,
  );
}

/**
 * DELETE /api/collections/:id/share
 * Revoke the share link for a collection
 */
async function handleDelete(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
  collectionId: string,
): Promise<void> {
  // Check if collection exists
  const collection = await getCollectionById(collectionId, req.userId);
  if (!collection) {
    sendError(res, new NotFoundError("Collection"));
    return;
  }

  const success = await unshareCollection(collectionId, req.userId);

  if (!success) {
    sendError(res, new NotFoundError("Collection"));
    return;
  }

  sendSuccess(res, { unshared: true }, 200);
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
