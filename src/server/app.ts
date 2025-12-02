/**
 * Hono API Server
 *
 * Main application setup with middleware and routes.
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { authRoutes } from "./routes/auth";
import { bookmarkRoutes } from "./routes/bookmarks";
import { categoryRoutes } from "./routes/categories";
import { collectionRoutes } from "./routes/collections";
import { healthRoutes } from "./routes/health";
import { searchRoutes } from "./routes/search";
import { statsRoutes } from "./routes/stats";
import { tagRoutes } from "./routes/tags";
import { userRoutes } from "./routes/user";

// Create Hono app
const app = new Hono().basePath("/api");

// Global middleware
app.use("*", logger());
app.use("*", secureHeaders());
app.use(
  "*",
  cors({
    origin: (origin) => origin || "*",
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// Mount routes
app.route("/auth", authRoutes);
app.route("/v1/health", healthRoutes);
app.route("/v1/bookmarks", bookmarkRoutes);
app.route("/v1/categories", categoryRoutes);
app.route("/v1/collections", collectionRoutes);
app.route("/v1/tags", tagRoutes);
app.route("/v1/search", searchRoutes);
app.route("/v1/stats", statsRoutes);
app.route("/v1/user", userRoutes);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: `Route ${c.req.method} ${c.req.path} not found`,
      },
    },
    404,
  );
});

// Error handler
app.onError((err, c) => {
  // biome-ignore lint/suspicious/noConsole: Server error logging is necessary
  console.error(`[API] Error:`, err);
  return c.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message:
          process.env.NODE_ENV === "development"
            ? err.message
            : "An unexpected error occurred",
      },
    },
    500,
  );
});

export { app };
