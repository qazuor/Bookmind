/**
 * Collections API - Single Collection Operations
 *
 * GET /api/collections/:id - Get a single collection
 * PATCH /api/collections/:id - Update a collection
 * DELETE /api/collections/:id - Delete a collection
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
  deleteCollection,
  getChildCollections,
  getCollectionByName,
  getCollectionWithCount,
  updateCollection,
  validateParentCollection,
} from "../../src/lib/services/collections";
import { updateCollectionSchema } from "../../src/schemas/collection.schema";

/**
 * GET /api/collections/:id
 * Get a single collection with bookmark count
 */
async function handleGet(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
  collectionId: string,
): Promise<void> {
  const collection = await getCollectionWithCount(collectionId, req.userId);

  if (!collection) {
    sendError(res, new NotFoundError("Collection"));
    return;
  }

  sendSuccess(res, collection);
}

/**
 * PATCH /api/collections/:id
 * Update a collection
 */
async function handlePatch(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
  collectionId: string,
): Promise<void> {
  // Validate request body
  const result = updateCollectionSchema.safeParse(req.body);
  if (!result.success) {
    sendError(
      res,
      new BadRequestError("Invalid collection data", {
        errors: result.error.issues,
      }),
    );
    return;
  }

  // Check if collection exists
  const existing = await getCollectionWithCount(collectionId, req.userId);
  if (!existing) {
    sendError(res, new NotFoundError("Collection"));
    return;
  }

  // Validate parent collection if being changed
  if (result.data.parentId !== undefined) {
    if (result.data.parentId !== null) {
      // Can't set self as parent
      if (result.data.parentId === collectionId) {
        sendError(
          res,
          new BadRequestError("Collection cannot be its own parent"),
        );
        return;
      }

      // Validate parent exists
      const parentExists = await validateParentCollection(
        result.data.parentId,
        req.userId,
      );
      if (!parentExists) {
        sendError(res, new BadRequestError("Parent collection not found"));
        return;
      }

      // Check for circular reference (parent can't be a child of this collection)
      const children = await getChildCollections(collectionId, req.userId);
      const childIds = new Set(children.map((c) => c.id));
      if (childIds.has(result.data.parentId)) {
        sendError(
          res,
          new BadRequestError("Cannot set a child collection as parent"),
        );
        return;
      }
    }
  }

  // Check for duplicate name if name is being changed
  if (result.data.name && result.data.name !== existing.name) {
    const targetParentId =
      result.data.parentId !== undefined
        ? result.data.parentId
        : existing.parentId;
    const duplicate = await getCollectionByName(
      result.data.name,
      req.userId,
      targetParentId,
    );
    if (duplicate && duplicate.id !== collectionId) {
      sendError(
        res,
        new ConflictError(
          "Collection with this name already exists at this level",
        ),
      );
      return;
    }
  }

  const updated = await updateCollection(collectionId, req.userId, result.data);

  sendSuccess(res, updated);
}

/**
 * DELETE /api/collections/:id
 * Delete a collection
 */
async function handleDelete(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
  collectionId: string,
): Promise<void> {
  // Check if collection exists
  const existing = await getCollectionWithCount(collectionId, req.userId);
  if (!existing) {
    sendError(res, new NotFoundError("Collection"));
    return;
  }

  await deleteCollection(collectionId, req.userId);

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
    sendError(res, new BadRequestError("Collection ID is required"));
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
