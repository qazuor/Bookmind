/**
 * Categories API - List and Create
 *
 * GET /api/categories - List user's categories
 * POST /api/categories - Create a new category
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
import {
  createCategory,
  getUserCategoriesWithCounts,
} from "../../src/lib/services/categories";
import { createCategorySchema } from "../../src/schemas/category.schema";

/**
 * GET /api/categories
 * List all categories for the authenticated user
 */
async function handleGet(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
): Promise<void> {
  const categories = await getUserCategoriesWithCounts(req.userId);

  sendSuccess(res, categories);
}

/**
 * POST /api/categories
 * Create a new category
 */
async function handlePost(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
): Promise<void> {
  // Validate request body
  const result = createCategorySchema.safeParse(req.body);
  if (!result.success) {
    const error = new BadRequestError("Invalid category data", {
      errors: result.error.issues,
    });
    sendError(res, error);
    return;
  }

  const category = await createCategory(req.userId, result.data);

  sendSuccess(res, category, 201);
}

/**
 * Main handler
 */
async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void | VercelResponse> {
  // Apply authentication
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

// Export with middleware
export default withErrorHandler(withRateLimit("api", handler));
