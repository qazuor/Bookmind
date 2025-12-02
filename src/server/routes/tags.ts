/**
 * Tag Routes
 */

import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "@/lib/db";
import { tags } from "@/lib/db/schema";
import { requireAuth } from "../middleware/auth";

const tagRoutes = new Hono();

tagRoutes.use("*", requireAuth);

// GET /tags - List tags
tagRoutes.get("/", async (c) => {
  const userId = c.get("userId");

  const results = await db
    .select()
    .from(tags)
    .where(eq(tags.userId, userId))
    .orderBy(tags.name);

  return c.json({ success: true, data: results });
});

// POST /tags - Create tag
tagRoutes.post("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  const { name, color } = body;

  if (!name) {
    return c.json(
      {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Name is required" },
      },
      400,
    );
  }

  const [tag] = await db
    .insert(tags)
    .values({
      userId,
      name,
      color: color ?? "#6366f1",
    })
    .returning();

  return c.json({ success: true, data: tag }, 201);
});

// PATCH /tags/:id - Update tag
tagRoutes.patch("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const body = await c.req.json();

  const [existing] = await db
    .select()
    .from(tags)
    .where(and(eq(tags.id, id), eq(tags.userId, userId)));

  if (!existing) {
    return c.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Tag not found" },
      },
      404,
    );
  }

  const { name, color } = body;

  const [updated] = await db
    .update(tags)
    .set({
      name: name ?? existing.name,
      color: color ?? existing.color,
      updatedAt: new Date(),
    })
    .where(eq(tags.id, id))
    .returning();

  return c.json({ success: true, data: updated });
});

// DELETE /tags/:id - Delete tag
tagRoutes.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const [deleted] = await db
    .delete(tags)
    .where(and(eq(tags.id, id), eq(tags.userId, userId)))
    .returning();

  if (!deleted) {
    return c.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Tag not found" },
      },
      404,
    );
  }

  return c.json({ success: true, data: { id } });
});

export { tagRoutes };
