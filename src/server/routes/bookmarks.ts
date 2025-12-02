/**
 * Bookmark Routes
 */

import { and, asc, desc, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "@/lib/db";
import {
  bookmarkCollections,
  bookmarks,
  bookmarkTags,
  collections,
  tags,
} from "@/lib/db/schema";
import { requireAuth } from "../middleware/auth";

const bookmarkRoutes = new Hono();

// All bookmark routes require authentication
bookmarkRoutes.use("*", requireAuth);

// GET /bookmarks - List bookmarks
bookmarkRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  const { page = "1", limit = "20", order = "desc" } = c.req.query();

  const pageNum = Number.parseInt(page, 10);
  const limitNum = Math.min(Number.parseInt(limit, 10), 100);
  const offset = (pageNum - 1) * limitNum;

  const orderBy =
    order === "asc" ? asc(bookmarks.createdAt) : desc(bookmarks.createdAt);

  const results = await db
    .select()
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId))
    .orderBy(orderBy)
    .limit(limitNum)
    .offset(offset);

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId));

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

// POST /bookmarks - Create bookmark
bookmarkRoutes.post("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  const {
    url,
    title,
    description,
    notes,
    categoryId,
    isPublic,
    isPinned,
    tagIds,
    collectionIds,
  } = body;

  if (!(url && title)) {
    return c.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "URL and title are required",
        },
      },
      400,
    );
  }

  // Create bookmark
  const [bookmark] = await db
    .insert(bookmarks)
    .values({
      userId,
      url,
      title,
      description,
      notes,
      categoryId,
      isPublic: isPublic ?? false,
      isPinned: isPinned ?? false,
    })
    .returning();

  if (!bookmark) {
    return c.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to create bookmark" },
      },
      500,
    );
  }

  // Add tags if provided
  if (tagIds && tagIds.length > 0) {
    await db.insert(bookmarkTags).values(
      tagIds.map((tagId: string) => ({
        bookmarkId: bookmark.id,
        tagId,
      })),
    );
  }

  // Add to collections if provided
  if (collectionIds && collectionIds.length > 0) {
    await db.insert(bookmarkCollections).values(
      collectionIds.map((collectionId: string) => ({
        bookmarkId: bookmark.id,
        collectionId,
      })),
    );
  }

  return c.json({ success: true, data: bookmark }, 201);
});

// GET /bookmarks/:id - Get single bookmark
bookmarkRoutes.get("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const [bookmark] = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)));

  if (!bookmark) {
    return c.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Bookmark not found" },
      },
      404,
    );
  }

  // Get tags
  const bookmarkTagsResult = await db
    .select({ tag: tags })
    .from(bookmarkTags)
    .innerJoin(tags, eq(bookmarkTags.tagId, tags.id))
    .where(eq(bookmarkTags.bookmarkId, id));

  // Get collections
  const bookmarkCollectionsResult = await db
    .select({ collection: collections })
    .from(bookmarkCollections)
    .innerJoin(
      collections,
      eq(bookmarkCollections.collectionId, collections.id),
    )
    .where(eq(bookmarkCollections.bookmarkId, id));

  return c.json({
    success: true,
    data: {
      ...bookmark,
      tags: bookmarkTagsResult.map((r) => r.tag),
      collections: bookmarkCollectionsResult.map((r) => r.collection),
    },
  });
});

// PATCH /bookmarks/:id - Update bookmark
bookmarkRoutes.patch("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const body = await c.req.json();

  // Verify ownership
  const [existing] = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)));

  if (!existing) {
    return c.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Bookmark not found" },
      },
      404,
    );
  }

  const {
    url,
    title,
    description,
    notes,
    categoryId,
    isPublic,
    isPinned,
    tagIds,
    collectionIds,
  } = body;

  // Update bookmark
  const [updated] = await db
    .update(bookmarks)
    .set({
      url: url ?? existing.url,
      title: title ?? existing.title,
      description:
        description !== undefined ? description : existing.description,
      notes: notes !== undefined ? notes : existing.notes,
      categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
      isPublic: isPublic !== undefined ? isPublic : existing.isPublic,
      isPinned: isPinned !== undefined ? isPinned : existing.isPinned,
      updatedAt: new Date(),
    })
    .where(eq(bookmarks.id, id))
    .returning();

  // Update tags if provided
  if (tagIds !== undefined) {
    await db.delete(bookmarkTags).where(eq(bookmarkTags.bookmarkId, id));
    if (tagIds.length > 0) {
      await db.insert(bookmarkTags).values(
        tagIds.map((tagId: string) => ({
          bookmarkId: id,
          tagId,
        })),
      );
    }
  }

  // Update collections if provided
  if (collectionIds !== undefined) {
    await db
      .delete(bookmarkCollections)
      .where(eq(bookmarkCollections.bookmarkId, id));
    if (collectionIds.length > 0) {
      await db.insert(bookmarkCollections).values(
        collectionIds.map((collectionId: string) => ({
          bookmarkId: id,
          collectionId,
        })),
      );
    }
  }

  return c.json({ success: true, data: updated });
});

// DELETE /bookmarks/:id - Delete bookmark
bookmarkRoutes.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const [deleted] = await db
    .delete(bookmarks)
    .where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)))
    .returning();

  if (!deleted) {
    return c.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Bookmark not found" },
      },
      404,
    );
  }

  return c.json({ success: true, data: { id } });
});

export { bookmarkRoutes };
