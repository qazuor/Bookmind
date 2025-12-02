/**
 * User Routes
 */

import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireAuth } from "../middleware/auth";

const userRoutes = new Hono();

userRoutes.use("*", requireAuth);

// GET /user/profile - Get user profile
userRoutes.get("/profile", async (c) => {
  const userId = c.get("userId");

  const [user] = await db.select().from(users).where(eq(users.id, userId));

  if (!user) {
    return c.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "User not found" },
      },
      404,
    );
  }

  return c.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      username: user.username,
      bio: user.bio,
      language: user.language,
      theme: user.theme,
      defaultVisibility: user.defaultVisibility,
      emailNotifications: user.emailNotifications,
      createdAt: user.createdAt,
    },
  });
});

// PATCH /user/profile - Update user profile
userRoutes.patch("/profile", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  const {
    name,
    username,
    bio,
    language,
    theme,
    defaultVisibility,
    emailNotifications,
  } = body;

  const [updated] = await db
    .update(users)
    .set({
      name: name !== undefined ? name : undefined,
      username: username !== undefined ? username : undefined,
      bio: bio !== undefined ? bio : undefined,
      language: language !== undefined ? language : undefined,
      theme: theme !== undefined ? theme : undefined,
      defaultVisibility:
        defaultVisibility !== undefined ? defaultVisibility : undefined,
      emailNotifications:
        emailNotifications !== undefined ? emailNotifications : undefined,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  if (!updated) {
    return c.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "User not found" },
      },
      404,
    );
  }

  return c.json({
    success: true,
    data: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      image: updated.image,
      username: updated.username,
      bio: updated.bio,
      language: updated.language,
      theme: updated.theme,
      defaultVisibility: updated.defaultVisibility,
      emailNotifications: updated.emailNotifications,
    },
  });
});

export { userRoutes };
