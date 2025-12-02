/**
 * Public Bookmarks API
 *
 * GET /api/public/bookmarks/:id - Get public bookmark
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { and, eq } from "drizzle-orm";
import {
  BadRequestError,
  NotFoundError,
  sendError,
  sendSuccess,
} from "../../../src/lib/api/errors";
import { withErrorHandler, withRateLimit } from "../../../src/lib/api/index";
import { db } from "../../../src/lib/db";
import {
  bookmarks,
  bookmarkTags,
  categories,
  tags,
  users,
} from "../../../src/lib/db/schema";

/**
 * GET /api/public/bookmarks/:id
 * Get a public bookmark
 */
async function handleGet(
  _req: VercelRequest,
  res: VercelResponse,
  bookmarkId: string,
): Promise<void> {
  // Get bookmark only if public
  const result = await db
    .select({
      id: bookmarks.id,
      url: bookmarks.url,
      title: bookmarks.title,
      description: bookmarks.description,
      favicon: bookmarks.favicon,
      ogImage: bookmarks.ogImage,
      aiSummary: bookmarks.aiSummary,
      categoryId: bookmarks.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color,
      ownerUsername: users.username,
      ownerName: users.name,
      ownerAvatarUrl: users.avatarUrl,
      createdAt: bookmarks.createdAt,
    })
    .from(bookmarks)
    .innerJoin(users, eq(users.id, bookmarks.userId))
    .leftJoin(categories, eq(categories.id, bookmarks.categoryId))
    .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.isPublic, true)))
    .limit(1);

  if (!result[0]) {
    sendError(res, new NotFoundError("Bookmark not found or not public"));
    return;
  }

  const bookmark = result[0];

  // Get tags
  const tagResults = await db
    .select({
      id: tags.id,
      name: tags.name,
      color: tags.color,
    })
    .from(tags)
    .innerJoin(bookmarkTags, eq(bookmarkTags.tagId, tags.id))
    .where(eq(bookmarkTags.bookmarkId, bookmarkId));

  sendSuccess(res, {
    id: bookmark.id,
    url: bookmark.url,
    title: bookmark.title,
    description: bookmark.description,
    favicon: bookmark.favicon,
    ogImage: bookmark.ogImage,
    aiSummary: bookmark.aiSummary,
    category: bookmark.categoryId
      ? {
          id: bookmark.categoryId,
          name: bookmark.categoryName,
          color: bookmark.categoryColor,
        }
      : null,
    tags: tagResults,
    owner: {
      username: bookmark.ownerUsername ?? "anonymous",
      name: bookmark.ownerName,
      avatarUrl: bookmark.ownerAvatarUrl,
    },
    createdAt: bookmark.createdAt,
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

  switch (req.method) {
    case "GET":
      return handleGet(req, res, id);
    default:
      res.setHeader("Allow", "GET");
      res.status(405).json({ error: "Method not allowed" });
  }
}

export default withErrorHandler(withRateLimit("public", handler));
