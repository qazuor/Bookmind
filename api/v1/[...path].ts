/**
 * =============================================================================
 * CATCH-ALL API ROUTER
 * =============================================================================
 *
 * ⚠️  TEMPORARY WORKAROUND - DO NOT EXPAND
 *
 * This file exists ONLY because Vercel's Hobby plan limits deployments to
 * 12 Serverless Functions. Our API has 27+ endpoints.
 *
 * WHEN TO REMOVE THIS FILE:
 * - When upgrading to Vercel Pro plan ($20/month)
 * - When migrating to a different hosting provider
 * - When using a custom server (Express, Hono, etc.)
 *
 * HOW TO REVERT:
 * 1. Delete this file (api/v1/[...path].ts)
 * 2. The original files in api/ will become individual serverless functions
 * 3. Update frontend API_URL from /api/v1 to /api
 *
 * TRADEOFFS OF THIS APPROACH:
 * - Slower cold starts (all code loads together)
 * - Less granular logs in Vercel dashboard
 * - Single point of failure for all API routes
 *
 * =============================================================================
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

// Import handlers from service modules
// NOTE: Using relative paths with explicit file extensions for Vercel ES modules compatibility
import { db } from "../../src/lib/db/index.js";
import {
  bookmarks,
  bookmarkTags,
  bookmarkCollections,
  categories,
  collections,
  tags,
  users,
  sessions,
} from "../../src/lib/db/schema.js";
import { eq, and, desc, asc, sql, ilike, or, inArray } from "drizzle-orm";

// =============================================================================
// TYPES
// =============================================================================

interface RouteHandler {
  (req: VercelRequest, res: VercelResponse): Promise<void>;
}

interface Route {
  method: string;
  pattern: RegExp;
  params: string[];
  handler: RouteHandler;
}

// =============================================================================
// UTILITIES
// =============================================================================

function sendJson(res: VercelResponse, status: number, data: unknown): void {
  res.status(status).json(data);
}

function sendSuccess<T>(res: VercelResponse, data: T, status = 200): void {
  sendJson(res, status, { success: true, data });
}

function sendError(
  res: VercelResponse,
  status: number,
  code: string,
  message: string,
): void {
  sendJson(res, status, { success: false, error: { code, message } });
}

function getPathParams(
  path: string,
  pattern: RegExp,
  paramNames: string[],
): Record<string, string> {
  const match = path.match(pattern);
  if (!match) return {};

  const params: Record<string, string> = {};
  paramNames.forEach((name, index) => {
    params[name] = match[index + 1] || "";
  });
  return params;
}

// Simple auth check - in production use proper auth middleware
async function getUserId(req: VercelRequest): Promise<string | null> {
  // TODO: Implement proper auth check using Better Auth session
  // For now, check for session cookie or authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    // Validate token and return user ID
    return null; // Placeholder
  }
  return null;
}

// =============================================================================
// ROUTE DEFINITIONS
// =============================================================================

const routes: Route[] = [];

function addRoute(method: string, path: string, handler: RouteHandler): void {
  // Convert path pattern to regex
  // e.g., "/bookmarks/:id" -> /^\/bookmarks\/([^/]+)$/
  const paramNames: string[] = [];
  const regexPattern = path
    .replace(/:([^/]+)/g, (_, param) => {
      paramNames.push(param);
      return "([^/]+)";
    })
    .replace(/\//g, "\\/");

  routes.push({
    method,
    pattern: new RegExp(`^${regexPattern}$`),
    params: paramNames,
    handler,
  });
}

// =============================================================================
// HEALTH CHECK
// =============================================================================

addRoute("GET", "/health", async (_req, res) => {
  sendSuccess(res, {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// =============================================================================
// BOOKMARKS
// =============================================================================

addRoute("GET", "/bookmarks", async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
    }

    const { page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);
    const offset = (pageNum - 1) * limitNum;

    const results = await db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt))
      .limit(limitNum)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId));

    sendSuccess(res, {
      bookmarks: results,
      meta: {
        page: pageNum,
        limit: limitNum,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limitNum),
      },
    });
  } catch (error) {
    console.error("[API] Error fetching bookmarks:", error);
    sendError(res, 500, "INTERNAL_ERROR", "Failed to fetch bookmarks");
  }
});

addRoute("POST", "/bookmarks", async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
    }

    const body = req.body as {
      url: string;
      title: string;
      description?: string;
      categoryId?: string;
      tagIds?: string[];
      collectionIds?: string[];
    };

    if (!body.url || !body.title) {
      return sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "URL and title are required",
      );
    }

    const [bookmark] = await db
      .insert(bookmarks)
      .values({
        userId,
        url: body.url,
        title: body.title,
        description: body.description,
        categoryId: body.categoryId,
      })
      .returning();

    // Add tags if provided
    if (body.tagIds?.length) {
      await db.insert(bookmarkTags).values(
        body.tagIds.map((tagId) => ({
          bookmarkId: bookmark.id,
          tagId,
        })),
      );
    }

    // Add to collections if provided
    if (body.collectionIds?.length) {
      await db.insert(bookmarkCollections).values(
        body.collectionIds.map((collectionId) => ({
          bookmarkId: bookmark.id,
          collectionId,
        })),
      );
    }

    sendSuccess(res, bookmark, 201);
  } catch (error) {
    console.error("[API] Error creating bookmark:", error);
    sendError(res, 500, "INTERNAL_ERROR", "Failed to create bookmark");
  }
});

addRoute("GET", "/bookmarks/:id", async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
    }

    const { id } = (req as any).params;

    const [bookmark] = await db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)));

    if (!bookmark) {
      return sendError(res, 404, "NOT_FOUND", "Bookmark not found");
    }

    sendSuccess(res, bookmark);
  } catch (error) {
    console.error("[API] Error fetching bookmark:", error);
    sendError(res, 500, "INTERNAL_ERROR", "Failed to fetch bookmark");
  }
});

addRoute("PATCH", "/bookmarks/:id", async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
    }

    const { id } = (req as any).params;
    const body = req.body as Partial<{
      url: string;
      title: string;
      description: string;
      notes: string;
      categoryId: string;
      isPublic: boolean;
      isPinned: boolean;
      isArchived: boolean;
    }>;

    const [existing] = await db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)));

    if (!existing) {
      return sendError(res, 404, "NOT_FOUND", "Bookmark not found");
    }

    const [updated] = await db
      .update(bookmarks)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(bookmarks.id, id))
      .returning();

    sendSuccess(res, updated);
  } catch (error) {
    console.error("[API] Error updating bookmark:", error);
    sendError(res, 500, "INTERNAL_ERROR", "Failed to update bookmark");
  }
});

addRoute("DELETE", "/bookmarks/:id", async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
    }

    const { id } = (req as any).params;

    const [existing] = await db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)));

    if (!existing) {
      return sendError(res, 404, "NOT_FOUND", "Bookmark not found");
    }

    await db.delete(bookmarks).where(eq(bookmarks.id, id));

    sendSuccess(res, { deleted: true });
  } catch (error) {
    console.error("[API] Error deleting bookmark:", error);
    sendError(res, 500, "INTERNAL_ERROR", "Failed to delete bookmark");
  }
});

// =============================================================================
// CATEGORIES
// =============================================================================

addRoute("GET", "/categories", async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
    }

    const results = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(asc(categories.name));

    sendSuccess(res, results);
  } catch (error) {
    console.error("[API] Error fetching categories:", error);
    sendError(res, 500, "INTERNAL_ERROR", "Failed to fetch categories");
  }
});

addRoute("POST", "/categories", async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
    }

    const body = req.body as {
      name: string;
      color?: string;
      icon?: string;
    };

    if (!body.name) {
      return sendError(res, 400, "VALIDATION_ERROR", "Name is required");
    }

    const [category] = await db
      .insert(categories)
      .values({
        userId,
        name: body.name,
        color: body.color || "#6366f1",
        icon: body.icon,
      })
      .returning();

    sendSuccess(res, category, 201);
  } catch (error) {
    console.error("[API] Error creating category:", error);
    sendError(res, 500, "INTERNAL_ERROR", "Failed to create category");
  }
});

addRoute("PATCH", "/categories/:id", async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
    }

    const { id } = (req as any).params;
    const body = req.body as Partial<{
      name: string;
      color: string;
      icon: string;
    }>;

    const [existing] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));

    if (!existing) {
      return sendError(res, 404, "NOT_FOUND", "Category not found");
    }

    const [updated] = await db
      .update(categories)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();

    sendSuccess(res, updated);
  } catch (error) {
    console.error("[API] Error updating category:", error);
    sendError(res, 500, "INTERNAL_ERROR", "Failed to update category");
  }
});

addRoute("DELETE", "/categories/:id", async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
    }

    const { id } = (req as any).params;

    const [existing] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));

    if (!existing) {
      return sendError(res, 404, "NOT_FOUND", "Category not found");
    }

    await db.delete(categories).where(eq(categories.id, id));

    sendSuccess(res, { deleted: true });
  } catch (error) {
    console.error("[API] Error deleting category:", error);
    sendError(res, 500, "INTERNAL_ERROR", "Failed to delete category");
  }
});

// =============================================================================
// COLLECTIONS
// =============================================================================

addRoute("GET", "/collections", async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
    }

    const results = await db
      .select()
      .from(collections)
      .where(eq(collections.userId, userId))
      .orderBy(asc(collections.name));

    sendSuccess(res, results);
  } catch (error) {
    console.error("[API] Error fetching collections:", error);
    sendError(res, 500, "INTERNAL_ERROR", "Failed to fetch collections");
  }
});

addRoute("POST", "/collections", async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
    }

    const body = req.body as {
      name: string;
      description?: string;
      parentId?: string;
    };

    if (!body.name) {
      return sendError(res, 400, "VALIDATION_ERROR", "Name is required");
    }

    const [collection] = await db
      .insert(collections)
      .values({
        userId,
        name: body.name,
        description: body.description,
        parentId: body.parentId,
      })
      .returning();

    sendSuccess(res, collection, 201);
  } catch (error) {
    console.error("[API] Error creating collection:", error);
    sendError(res, 500, "INTERNAL_ERROR", "Failed to create collection");
  }
});

addRoute("PATCH", "/collections/:id", async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
    }

    const { id } = (req as any).params;
    const body = req.body as Partial<{
      name: string;
      description: string;
      parentId: string;
      isPublic: boolean;
    }>;

    const [existing] = await db
      .select()
      .from(collections)
      .where(and(eq(collections.id, id), eq(collections.userId, userId)));

    if (!existing) {
      return sendError(res, 404, "NOT_FOUND", "Collection not found");
    }

    const [updated] = await db
      .update(collections)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(collections.id, id))
      .returning();

    sendSuccess(res, updated);
  } catch (error) {
    console.error("[API] Error updating collection:", error);
    sendError(res, 500, "INTERNAL_ERROR", "Failed to update collection");
  }
});

addRoute("DELETE", "/collections/:id", async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
    }

    const { id } = (req as any).params;

    const [existing] = await db
      .select()
      .from(collections)
      .where(and(eq(collections.id, id), eq(collections.userId, userId)));

    if (!existing) {
      return sendError(res, 404, "NOT_FOUND", "Collection not found");
    }

    await db.delete(collections).where(eq(collections.id, id));

    sendSuccess(res, { deleted: true });
  } catch (error) {
    console.error("[API] Error deleting collection:", error);
    sendError(res, 500, "INTERNAL_ERROR", "Failed to delete collection");
  }
});

// =============================================================================
// TAGS
// =============================================================================

addRoute("GET", "/tags", async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
    }

    const results = await db
      .select()
      .from(tags)
      .where(eq(tags.userId, userId))
      .orderBy(asc(tags.name));

    sendSuccess(res, results);
  } catch (error) {
    console.error("[API] Error fetching tags:", error);
    sendError(res, 500, "INTERNAL_ERROR", "Failed to fetch tags");
  }
});

addRoute("POST", "/tags", async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
    }

    const body = req.body as {
      name: string;
      color?: string;
    };

    if (!body.name) {
      return sendError(res, 400, "VALIDATION_ERROR", "Name is required");
    }

    const [tag] = await db
      .insert(tags)
      .values({
        userId,
        name: body.name.toLowerCase(),
        color: body.color,
      })
      .returning();

    sendSuccess(res, tag, 201);
  } catch (error) {
    console.error("[API] Error creating tag:", error);
    sendError(res, 500, "INTERNAL_ERROR", "Failed to create tag");
  }
});

addRoute("DELETE", "/tags/:id", async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
    }

    const { id } = (req as any).params;

    const [existing] = await db
      .select()
      .from(tags)
      .where(and(eq(tags.id, id), eq(tags.userId, userId)));

    if (!existing) {
      return sendError(res, 404, "NOT_FOUND", "Tag not found");
    }

    await db.delete(tags).where(eq(tags.id, id));

    sendSuccess(res, { deleted: true });
  } catch (error) {
    console.error("[API] Error deleting tag:", error);
    sendError(res, 500, "INTERNAL_ERROR", "Failed to delete tag");
  }
});

// =============================================================================
// SEARCH
// =============================================================================

addRoute("GET", "/search", async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
    }

    const {
      q = "",
      page = "1",
      limit = "20",
    } = req.query as Record<string, string>;
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);
    const offset = (pageNum - 1) * limitNum;

    if (!q.trim()) {
      return sendSuccess(res, {
        bookmarks: [],
        meta: { page: pageNum, limit: limitNum, total: 0, totalPages: 0 },
      });
    }

    const searchPattern = `%${q}%`;

    const results = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          or(
            ilike(bookmarks.title, searchPattern),
            ilike(bookmarks.url, searchPattern),
            ilike(bookmarks.description, searchPattern),
            ilike(bookmarks.notes, searchPattern),
          ),
        ),
      )
      .orderBy(desc(bookmarks.createdAt))
      .limit(limitNum)
      .offset(offset);

    sendSuccess(res, {
      bookmarks: results,
      meta: {
        page: pageNum,
        limit: limitNum,
        total: results.length,
        totalPages: 1,
      },
    });
  } catch (error) {
    console.error("[API] Error searching:", error);
    sendError(res, 500, "INTERNAL_ERROR", "Search failed");
  }
});

// =============================================================================
// STATS
// =============================================================================

addRoute("GET", "/stats", async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
    }

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

    sendSuccess(res, {
      bookmarks: Number(bookmarkCount.count),
      categories: Number(categoryCount.count),
      collections: Number(collectionCount.count),
      tags: Number(tagCount.count),
    });
  } catch (error) {
    console.error("[API] Error fetching stats:", error);
    sendError(res, 500, "INTERNAL_ERROR", "Failed to fetch stats");
  }
});

// =============================================================================
// USER PROFILE
// =============================================================================

addRoute("GET", "/user/profile", async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return sendError(res, 404, "NOT_FOUND", "User not found");
    }

    sendSuccess(res, {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      bio: user.bio,
      image: user.image,
      language: user.language,
      theme: user.theme,
    });
  } catch (error) {
    console.error("[API] Error fetching profile:", error);
    sendError(res, 500, "INTERNAL_ERROR", "Failed to fetch profile");
  }
});

addRoute("PATCH", "/user/profile", async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
    }

    const body = req.body as Partial<{
      name: string;
      username: string;
      bio: string;
    }>;

    const [updated] = await db
      .update(users)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    sendSuccess(res, {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      username: updated.username,
      bio: updated.bio,
      image: updated.image,
    });
  } catch (error) {
    console.error("[API] Error updating profile:", error);
    sendError(res, 500, "INTERNAL_ERROR", "Failed to update profile");
  }
});

// =============================================================================
// MAIN HANDLER
// =============================================================================

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  // Extract path from catch-all parameter
  const pathParam = req.query.path;
  const pathSegments = Array.isArray(pathParam) ? pathParam : [pathParam];
  const path = "/" + pathSegments.filter(Boolean).join("/");
  const method = req.method || "GET";

  // Find matching route
  for (const route of routes) {
    if (route.method === method && route.pattern.test(path)) {
      // Extract params and attach to request
      const params = getPathParams(path, route.pattern, route.params);
      (req as any).params = params;

      try {
        await route.handler(req, res);
        return;
      } catch (error) {
        console.error(`[API] Unhandled error in ${method} ${path}:`, error);
        sendError(res, 500, "INTERNAL_ERROR", "An unexpected error occurred");
        return;
      }
    }
  }

  // No route matched
  sendError(res, 404, "NOT_FOUND", `Route ${method} ${path} not found`);
}
