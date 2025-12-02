/**
 * Stats Routes
 */

import { and, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "@/lib/db";
import { bookmarks, categories, collections, tags } from "@/lib/db/schema";
import { requireAuth } from "../middleware/auth";

const statsRoutes = new Hono();

statsRoutes.use("*", requireAuth);

// GET /stats - Get user statistics
statsRoutes.get("/", async (c) => {
  const userId = c.get("userId");

  const [bookmarkCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId));

  const [categoryCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(categories)
    .where(eq(categories.userId, userId));

  const [collectionCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(collections)
    .where(eq(collections.userId, userId));

  const [tagCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(tags)
    .where(eq(tags.userId, userId));

  const [pinnedCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.isPinned, true)));

  const [archivedCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.isArchived, true)));

  return c.json({
    success: true,
    data: {
      bookmarks: Number(bookmarkCount?.count ?? 0),
      categories: Number(categoryCount?.count ?? 0),
      collections: Number(collectionCount?.count ?? 0),
      tags: Number(tagCount?.count ?? 0),
      pinned: Number(pinnedCount?.count ?? 0),
      archived: Number(archivedCount?.count ?? 0),
    },
  });
});

export { statsRoutes };
