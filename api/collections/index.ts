/**
 * Collections API - List, Create, and Tree
 *
 * GET /api/collections - List user's collections
 * GET /api/collections?tree=true - Get collections as tree structure
 * POST /api/collections - Create a new collection
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
  createCollection,
  getCollectionByName,
  getCollectionTree,
  getUserCollectionsWithCounts,
  validateParentCollection,
} from "../../src/lib/services/collections";
import { createCollectionSchema } from "../../src/schemas/collection.schema";

/**
 * GET /api/collections
 * List all collections for the authenticated user
 */
async function handleGet(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
): Promise<void> {
  const { tree } = req.query;

  if (tree === "true") {
    const collections = await getCollectionTree(req.userId);
    sendSuccess(res, collections);
    return;
  }

  const collections = await getUserCollectionsWithCounts(req.userId);
  sendSuccess(res, collections);
}

/**
 * POST /api/collections
 * Create a new collection
 */
async function handlePost(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
): Promise<void> {
  // Validate request body
  const result = createCollectionSchema.safeParse(req.body);
  if (!result.success) {
    sendError(
      res,
      new BadRequestError("Invalid collection data", {
        errors: result.error.issues,
      }),
    );
    return;
  }

  // Validate parent collection if provided
  if (result.data.parentId) {
    const parentExists = await validateParentCollection(
      result.data.parentId,
      req.userId,
    );
    if (!parentExists) {
      sendError(res, new BadRequestError("Parent collection not found"));
      return;
    }
  }

  // Check for duplicate name at the same level
  const existing = await getCollectionByName(
    result.data.name,
    req.userId,
    result.data.parentId ?? null,
  );
  if (existing) {
    sendError(
      res,
      new ConflictError(
        "Collection with this name already exists at this level",
      ),
    );
    return;
  }

  const collection = await createCollection(req.userId, result.data);

  sendSuccess(res, collection, 201);
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
