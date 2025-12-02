/**
 * Hono Server Entry Point
 *
 * Starts the HTTP server for local development.
 * For production (Vercel), use the Vercel adapter.
 */

// Load environment variables first
import { config } from "dotenv";

config({ path: ".env.local" });

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
