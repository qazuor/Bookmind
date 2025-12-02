/**
 * Tags API - Single Tag Operations
 *
 * GET /api/tags/:id - Get a single tag
 * PATCH /api/tags/:id - Update a tag
 * DELETE /api/tags/:id - Delete a tag
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
  deleteTag,
  getTagById,
  getTagByName,
  updateTag,
} from "../../src/lib/services/tags";
import { updateTagSchema } from "../../src/schemas/tag.schema";

/**
 * GET /api/tags/:id
 * Get a single tag
 */
async function handleGet(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
  tagId: string,
): Promise<void> {
  const tag = await getTagById(tagId, req.userId);

  if (!tag) {
    sendError(res, new NotFoundError("Tag"));
    return;
  }

  sendSuccess(res, tag);
}

/**
 * PATCH /api/tags/:id
 * Update a tag
 */
async function handlePatch(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
  tagId: string,
): Promise<void> {
  // Validate request body
  const result = updateTagSchema.safeParse(req.body);
  if (!result.success) {
    sendError(
      res,
      new BadRequestError("Invalid tag data", {
        errors: result.error.issues,
      }),
    );
    return;
  }

  // Check if tag exists
  const existing = await getTagById(tagId, req.userId);
  if (!existing) {
    sendError(res, new NotFoundError("Tag"));
    return;
  }

  // Check for duplicate name if name is being changed
  if (result.data.name && result.data.name !== existing.name) {
    const duplicate = await getTagByName(result.data.name, req.userId);
    if (duplicate && duplicate.id !== tagId) {
      sendError(res, new ConflictError("Tag with this name already exists"));
      return;
    }
  }

  const updated = await updateTag(tagId, req.userId, result.data);

  sendSuccess(res, updated);
}

/**
 * DELETE /api/tags/:id
 * Delete a tag
 */
async function handleDelete(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
  tagId: string,
): Promise<void> {
  // Check if tag exists
  const existing = await getTagById(tagId, req.userId);
  if (!existing) {
    sendError(res, new NotFoundError("Tag"));
    return;
  }

  await deleteTag(tagId, req.userId);

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
    sendError(res, new BadRequestError("Tag ID is required"));
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
