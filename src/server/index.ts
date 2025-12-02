/**
 * Hono Server Entry Point
 *
 * Starts the HTTP server for local development.
 * For production (Vercel), use the Vercel adapter.
 *
 * Note: Environment variables are loaded via tsx --env-file flag
 */

import { serve } from "@hono/node-server";
import { app } from "./app";

const port = Number(process.env.PORT) || 3001;

// biome-ignore lint/suspicious/noConsole: Server startup logging
console.log(`[Server] Starting on port ${port}...`);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    // biome-ignore lint/suspicious/noConsole: Server startup logging
    console.log(`[Server] Listening on http://localhost:${info.port}`);
  },
);
