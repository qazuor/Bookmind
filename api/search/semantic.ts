/**
 * Semantic Search API (P4-012)
 *
 * GET /api/search/semantic - AI-powered semantic search
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { and, eq } from "drizzle-orm";
import { AIError, type SearchBookmark, semanticSearch } from "../../src/lib/ai";
import { withAuth } from "../../src/lib/api/auth";
import {
  BadRequestError,
  sendError,
  sendSuccess,
} from "../../src/lib/api/errors";
import { withErrorHandler, withRateLimit } from "../../src/lib/api/index";
import type { ApiRequest } from "../../src/lib/api/types";
import { db } from "../../src/lib/db";
import {
  bookmarks,
  bookmarkTags,
  categories,
  tags,
} from "../../src/lib/db/schema";

/**
 * GET /api/search/semantic
 * Perform AI-powered semantic search over user's bookmarks
 */
async function handleGet(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
): Promise<void> {
  const query = req.query.q;
  const limit = Math.min(Number(req.query.limit) || 20, 50);

  if (!query || typeof query !== "string" || query.trim().length < 2) {
    sendError(
      res,
      new BadRequestError("Search query (q) must be at least 2 characters"),
    );
    return;
  }

  // Get user's bookmarks (limited to prevent token overflow)
  const userBookmarks = await db
    .select({
      id: bookmarks.id,
      title: bookmarks.title,
      url: bookmarks.url,
      description: bookmarks.description,
      categoryId: bookmarks.categoryId,
      categoryName: categories.name,
    })
    .from(bookmarks)
    .leftJoin(categories, eq(categories.id, bookmarks.categoryId))
    .where(
      and(eq(bookmarks.userId, req.userId), eq(bookmarks.isArchived, false)),
    )
    .limit(limit);

  if (userBookmarks.length === 0) {
    sendSuccess(res, {
      results: [],
      query: query.trim(),
      total: 0,
    });
    return;
  }

  // Get tags for each bookmark
  const bookmarkIds = userBookmarks.map((b) => b.id);
  const allTags = await db
    .select({
      bookmarkId: bookmarkTags.bookmarkId,
      tagName: tags.name,
    })
    .from(bookmarkTags)
    .innerJoin(tags, eq(tags.id, bookmarkTags.tagId))
    .where(
      // Using raw SQL-like approach with Drizzle
      // @ts-expect-error - Drizzle typing for IN clause
      bookmarkTags.bookmarkId.in
        ? bookmarkTags.bookmarkId.in(bookmarkIds)
        : eq(bookmarkTags.bookmarkId, bookmarkIds[0]),
    );

  // Build tag map
  const tagMap = new Map<string, string[]>();
  for (const tag of allTags) {
    const existing = tagMap.get(tag.bookmarkId) ?? [];
    existing.push(tag.tagName);
    tagMap.set(tag.bookmarkId, existing);
  }

  // Prepare bookmarks for semantic search
  const searchBookmarks: SearchBookmark[] = userBookmarks.map((b) => ({
    id: b.id,
    title: b.title,
    url: b.url,
    description: b.description ?? undefined,
    tags: tagMap.get(b.id),
    category: b.categoryName ?? undefined,
  }));

  try {
    // Perform semantic search
    const searchResult = await semanticSearch(req.userId, {
      query: query.trim(),
      bookmarks: searchBookmarks,
    });

    // Get full bookmark data for results
    const rankedBookmarks = searchResult.results.map((r) => {
      const bookmark = userBookmarks.find((b) => b.id === r.id);
      return {
        ...bookmark,
        relevanceScore: r.score,
        matchReason: r.reason,
        tags: tagMap.get(r.id) ?? [],
      };
    });

    sendSuccess(res, {
      results: rankedBookmarks,
      query: query.trim(),
      interpretation: searchResult.interpretation,
      total: rankedBookmarks.length,
      tokensUsed: searchResult.tokensUsed,
    });
  } catch (error) {
    if (error instanceof AIError) {
      if (error.code === "RATE_LIMITED") {
        sendError(res, new BadRequestError(error.message));
        return;
      }
      sendError(res, new BadRequestError(`AI search failed: ${error.message}`));
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
  const authHandler = withAuth(async (authReq, authRes) => {
    switch (authReq.method) {
      case "GET":
        return handleGet(authReq, authRes);
      default:
        authRes.setHeader("Allow", "GET");
        authRes.status(405).json({ error: "Method not allowed" });
    }
  });

  return authHandler(req as ApiRequest, res);
}

export default withErrorHandler(withRateLimit("search", handler));
