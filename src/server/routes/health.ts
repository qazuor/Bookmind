/**
 * Health Check Routes
 */

import { Hono } from "hono";

const healthRoutes = new Hono();

healthRoutes.get("/", (c) => {
  return c.json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
  });
});

export { healthRoutes };
