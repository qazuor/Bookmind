/**
 * Vercel API Handler
 *
 * Single entry point that delegates to Hono app.
 * Uses Vercel's catch-all route to handle all /api/* requests.
 */

import { handle } from "hono/vercel";
import { app } from "../src/server/app";

export default handle(app);
