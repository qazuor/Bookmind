/**
 * Collection Routes
 */

import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "@/lib/db";
import { collections } from "@/lib/db/schema";
import { requireAuth } from "../middleware/auth";

const collectionRoutes = new Hono();

collectionRoutes.use("*", requireAuth);

// GET /collections - List collections
collectionRoutes.get("/", async (c) => {
  const userId = c.get("userId");

  const results = await db
    .select()
    .from(collections)
    .where(eq(collections.userId, userId))
    .orderBy(collections.name);

  return c.json({ success: true, data: results });
});

// POST /collections - Create collection
collectionRoutes.post("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  const { name, description, isPublic } = body;

  if (!name) {
    return c.json(
      {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Name is required" },
      },
      400,
    );
  }

  const [collection] = await db
    .insert(collections)
    .values({
      userId,
      name,
      description,
      isPublic: isPublic ?? false,
    })
    .returning();

  return c.json({ success: true, data: collection }, 201);
});

// PATCH /collections/:id - Update collection
collectionRoutes.patch("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const body = await c.req.json();

  const [existing] = await db
    .select()
    .from(collections)
    .where(and(eq(collections.id, id), eq(collections.userId, userId)));

  if (!existing) {
    return c.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Collection not found" },
      },
      404,
    );
  }

  const { name, description, isPublic } = body;

  const [updated] = await db
    .update(collections)
    .set({
      name: name ?? existing.name,
      description:
        description !== undefined ? description : existing.description,
      isPublic: isPublic !== undefined ? isPublic : existing.isPublic,
      updatedAt: new Date(),
    })
    .where(eq(collections.id, id))
    .returning();

  return c.json({ success: true, data: updated });
});

// DELETE /collections/:id - Delete collection
collectionRoutes.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const [deleted] = await db
    .delete(collections)
    .where(and(eq(collections.id, id), eq(collections.userId, userId)))
    .returning();

  if (!deleted) {
    return c.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Collection not found" },
      },
      404,
    );
  }

  return c.json({ success: true, data: { id } });
});

export { collectionRoutes };
