/**
 * Tags API - List and Create
 *
 * GET /api/tags - List user's tags
 * POST /api/tags - Create a new tag
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
  createTag,
  getTagByName,
  getUserTagsWithCounts,
} from "../../src/lib/services/tags";
import { createTagSchema } from "../../src/schemas/tag.schema";

/**
 * GET /api/tags
 * List all tags for the authenticated user
 */
async function handleGet(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
): Promise<void> {
  const tags = await getUserTagsWithCounts(req.userId);

  sendSuccess(res, tags);
}

/**
 * POST /api/tags
 * Create a new tag
 */
async function handlePost(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
): Promise<void> {
  // Validate request body
  const result = createTagSchema.safeParse(req.body);
  if (!result.success) {
    sendError(
      res,
      new BadRequestError("Invalid tag data", {
        errors: result.error.issues,
      }),
    );
    return;
  }

  // Check for duplicate tag name
  const existing = await getTagByName(result.data.name, req.userId);
  if (existing) {
    sendError(res, new ConflictError("Tag with this name already exists"));
    return;
  }

  const tag = await createTag(req.userId, result.data);

  sendSuccess(res, tag, 201);
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
