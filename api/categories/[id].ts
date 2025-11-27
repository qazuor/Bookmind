/**
 * Categories API - Single Category Operations
 *
 * GET /api/categories/:id - Get a single category
 * PATCH /api/categories/:id - Update a category
 * DELETE /api/categories/:id - Delete a category
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withAuth } from "../../src/lib/api/auth";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  sendError,
  sendSuccess,
} from "../../src/lib/api/errors";
import { withErrorHandler, withRateLimit } from "../../src/lib/api/index";
import type { ApiRequest } from "../../src/lib/api/types";
import {
  deleteCategory,
  getCategoryById,
  updateCategory,
} from "../../src/lib/services/categories";
import { updateCategorySchema } from "../../src/schemas/category.schema";

/**
 * GET /api/categories/:id
 * Get a single category
 */
async function handleGet(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
  categoryId: string,
): Promise<void> {
  const category = await getCategoryById(categoryId, req.userId);

  if (!category) {
    sendError(res, new NotFoundError("Category"));
    return;
  }

  sendSuccess(res, category);
}

/**
 * PATCH /api/categories/:id
 * Update a category
 */
async function handlePatch(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
  categoryId: string,
): Promise<void> {
  // Validate request body
  const result = updateCategorySchema.safeParse(req.body);
  if (!result.success) {
    sendError(
      res,
      new BadRequestError("Invalid category data", {
        errors: result.error.issues,
      }),
    );
    return;
  }

  // Check if category exists
  const existing = await getCategoryById(categoryId, req.userId);
  if (!existing) {
    sendError(res, new NotFoundError("Category"));
    return;
  }

  const updated = await updateCategory(categoryId, req.userId, result.data);

  sendSuccess(res, updated);
}

/**
 * DELETE /api/categories/:id
 * Delete a category
 */
async function handleDelete(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
  categoryId: string,
): Promise<void> {
  // Check if category exists
  const existing = await getCategoryById(categoryId, req.userId);
  if (!existing) {
    sendError(res, new NotFoundError("Category"));
    return;
  }

  // Check if it's a default category
  if (existing.isDefault) {
    sendError(res, new ForbiddenError("Cannot delete default category"));
    return;
  }

  await deleteCategory(categoryId, req.userId);

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
    sendError(res, new BadRequestError("Category ID is required"));
    return;
  }

  // Apply authentication
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

// Export with middleware
export default withErrorHandler(withRateLimit("api", handler));
