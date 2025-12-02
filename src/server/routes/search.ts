/**
 * Search Routes
 */

import { and, eq, ilike, or, sql } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "@/lib/db";
import { bookmarks } from "@/lib/db/schema";
import { requireAuth } from "../middleware/auth";

const searchRoutes = new Hono();

searchRoutes.use("*", requireAuth);

// GET /search - Search bookmarks
searchRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  const { q, page = "1", limit = "20" } = c.req.query();

  if (!q || q.trim().length === 0) {
    return c.json({
      success: true,
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
  }

  const pageNum = Number.parseInt(page, 10);
  const limitNum = Math.min(Number.parseInt(limit, 10), 100);
  const offset = (pageNum - 1) * limitNum;
  const searchTerm = `%${q.trim()}%`;

  const results = await db
    .select()
    .from(bookmarks)
    .where(
      and(
        eq(bookmarks.userId, userId),
        or(
          ilike(bookmarks.title, searchTerm),
          ilike(bookmarks.description, searchTerm),
          ilike(bookmarks.url, searchTerm),
          ilike(bookmarks.notes, searchTerm),
        ),
      ),
    )
    .limit(limitNum)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookmarks)
    .where(
      and(
        eq(bookmarks.userId, userId),
        or(
          ilike(bookmarks.title, searchTerm),
          ilike(bookmarks.description, searchTerm),
          ilike(bookmarks.url, searchTerm),
          ilike(bookmarks.notes, searchTerm),
        ),
      ),
    );

  const total = Number(countResult[0]?.count ?? 0);

  return c.json({
    success: true,
    data: results,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

export { searchRoutes };
