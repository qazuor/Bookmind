/**
 * Health Check Endpoint
 * Simple endpoint to verify API routes are working
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withRateLimit } from "@/lib/api/middleware";

function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
}

export default withRateLimit("public", handler);
