/**
 * Bookmark AI Summary API (P4-011)
 *
 * POST /api/bookmarks/:id/ai/summary - Regenerate AI summary for a bookmark
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { AIError, generateSummary } from "../../../../src/lib/ai";
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
import { bookmarks } from "../../../../src/lib/db/schema";

/**
 * POST /api/bookmarks/:id/ai/summary
 * Regenerate the AI summary for a bookmark
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
      new ForbiddenError("Not authorized to modify this bookmark"),
    );
    return;
  }

  try {
    // Generate new summary
    const summaryResult = await generateSummary(req.userId, {
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description ?? undefined,
    });

    // Update bookmark with new summary
    await db
      .update(bookmarks)
      .set({
        aiSummary: summaryResult.summary || null,
        updatedAt: new Date(),
      })
      .where(eq(bookmarks.id, bookmarkId));

    sendSuccess(res, {
      summary: summaryResult.summary,
      tokensUsed: summaryResult.tokensUsed,
    });
  } catch (error) {
    if (error instanceof AIError) {
      if (error.code === "RATE_LIMITED") {
        sendError(res, new BadRequestError(error.message));
        return;
      }
      sendError(res, new BadRequestError(`AI error: ${error.message}`));
      return;
    }
    throw error;
  }
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
