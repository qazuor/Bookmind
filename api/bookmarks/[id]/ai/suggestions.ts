/**
 * Bookmark AI Suggestions API (P4-013, P4-014)
 *
 * POST /api/bookmarks/:id/ai/suggestions - Get AI suggestions for a bookmark
 * Returns suggested tags and category based on bookmark content
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { AIError, suggestCategory, suggestTags } from "../../../../src/lib/ai";
import { withAuth } from "../../../../src/lib/api/auth";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  sendError,
  sendSuccess,
} from "../../../../src/lib/api/errors";
import { withErrorHandler, withRateLimit } from "../../../../src/lib/api/index";
import type { ApiRequest } from "../../../../src/lib/api/types";
import { db } from "../../../../src/lib/db";
import { bookmarks, categories, tags } from "../../../../src/lib/db/schema";

/**
 * POST /api/bookmarks/:id/ai/suggestions
 * Get AI-generated tag and category suggestions for a bookmark
 */
async function handlePost(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
  bookmarkId: string,
): Promise<void> {
  // Get bookmark
  const result = await db
    .select({
      id: bookmarks.id,
      userId: bookmarks.userId,
      title: bookmarks.title,
      url: bookmarks.url,
      description: bookmarks.description,
    })
    .from(bookmarks)
    .where(eq(bookmarks.id, bookmarkId))
    .limit(1);

  if (!result[0]) {
    sendError(res, new NotFoundError("Bookmark"));
    return;
  }

  const bookmark = result[0];

  // Check ownership
  if (bookmark.userId !== req.userId) {
    sendError(
      res,
      new ForbiddenError("Not authorized to access this bookmark"),
    );
    return;
  }

  // Get user's existing tags and categories
  const [userTags, userCategories] = await Promise.all([
    db
      .select({ name: tags.name })
      .from(tags)
      .where(eq(tags.userId, req.userId)),
    db
      .select({ name: categories.name })
      .from(categories)
      .where(eq(categories.userId, req.userId)),
  ]);

  const existingTagNames = userTags.map((t) => t.name);
  const categoryNames = userCategories.map((c) => c.name);

  let totalTokens = 0;
  const suggestions: {
    tags?: string[];
    category?: { name: string; confidence: number };
  } = {};

  try {
    // Get tag suggestions
    const tagResult = await suggestTags(req.userId, {
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description ?? undefined,
      existingTags: existingTagNames,
    });
    suggestions.tags = tagResult.tags;
    totalTokens += tagResult.tokensUsed;
  } catch (error) {
    if (error instanceof AIError && error.code === "RATE_LIMITED") {
      sendError(res, new BadRequestError(error.message));
      return;
    }
    // Log but continue with category
    // biome-ignore lint/suspicious/noConsole: Intentional error logging
    console.error("[AI Suggestions] Tag suggestion failed:", error);
  }

  try {
    // Get category suggestion
    if (categoryNames.length > 0) {
      const categoryResult = await suggestCategory(req.userId, {
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description ?? undefined,
        categories: categoryNames,
      });
      if (categoryResult.confidence > 0.4) {
        suggestions.category = {
          name: categoryResult.category,
          confidence: categoryResult.confidence,
        };
      }
      totalTokens += categoryResult.tokensUsed;
    }
  } catch (error) {
    if (error instanceof AIError && error.code === "RATE_LIMITED") {
      sendError(res, new BadRequestError(error.message));
      return;
    }
    // biome-ignore lint/suspicious/noConsole: Intentional error logging
    console.error("[AI Suggestions] Category suggestion failed:", error);
  }

  sendSuccess(res, {
    bookmarkId,
    suggestions,
    tokensUsed: totalTokens,
  });
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
    sendError(res, new BadRequestError("Bookmark ID is required"));
    return;
  }

  const authHandler = withAuth(async (authReq, authRes) => {
    switch (authReq.method) {
      case "POST":
        return handlePost(authReq, authRes, id);
      default:
        authRes.setHeader("Allow", "POST");
        authRes.status(405).json({ error: "Method not allowed" });
    }
  });

  return authHandler(req as ApiRequest, res);
}

export default withErrorHandler(withRateLimit("ai", handler));
