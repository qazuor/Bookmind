/**
 * Category Routes
 */

import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { requireAuth } from "../middleware/auth";

const categoryRoutes = new Hono();

categoryRoutes.use("*", requireAuth);

// GET /categories - List categories
categoryRoutes.get("/", async (c) => {
  const userId = c.get("userId");

  const results = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.name);

  return c.json({ success: true, data: results });
});

// POST /categories - Create category
categoryRoutes.post("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  const { name, color, icon, description, isDefault } = body;

  if (!name) {
    return c.json(
      {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Name is required" },
      },
      400,
    );
  }

  const [category] = await db
    .insert(categories)
    .values({
      userId,
      name,
      color: color ?? "#6366f1",
      icon,
      description,
      isDefault: isDefault ?? false,
    })
    .returning();

  return c.json({ success: true, data: category }, 201);
});

// PATCH /categories/:id - Update category
categoryRoutes.patch("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const body = await c.req.json();

  const [existing] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)));

  if (!existing) {
    return c.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Category not found" },
      },
      404,
    );
  }

  const { name, color, icon, description, isDefault } = body;

  const [updated] = await db
    .update(categories)
    .set({
      name: name ?? existing.name,
      color: color ?? existing.color,
      icon: icon !== undefined ? icon : existing.icon,
      description:
        description !== undefined ? description : existing.description,
      isDefault: isDefault !== undefined ? isDefault : existing.isDefault,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, id))
    .returning();

  return c.json({ success: true, data: updated });
});

// DELETE /categories/:id - Delete category
categoryRoutes.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const [deleted] = await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .returning();

  if (!deleted) {
    return c.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Category not found" },
      },
      404,
    );
  }

  return c.json({ success: true, data: { id } });
});

export { categoryRoutes };
