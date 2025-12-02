/**
 * Stats API
 *
 * GET /api/stats - Get user statistics overview
 * GET /api/stats?activity=true - Get activity data
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withAuth } from "../../src/lib/api/auth";
import { sendSuccess } from "../../src/lib/api/errors";
import { withErrorHandler, withRateLimit } from "../../src/lib/api/index";
import type { ApiRequest } from "../../src/lib/api/types";
import {
  getActivityData,
  getTopCollections,
  getTopTags,
  getUserStats,
} from "../../src/lib/services/stats";

/**
 * GET /api/stats
 * Get user statistics
 */
async function handleGet(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
): Promise<void> {
  const { activity, days } = req.query;

  // If activity=true, return activity data
  if (activity === "true") {
    const daysNum = days ? Number.parseInt(days as string, 10) : 30;
    const activityData = await getActivityData(
      req.userId,
      Math.min(daysNum, 365),
    );

    sendSuccess(res, {
      activity: activityData,
      days: daysNum,
    });
    return;
  }

  // Get comprehensive stats
  const [stats, topTags, topCollections] = await Promise.all([
    getUserStats(req.userId),
    getTopTags(req.userId, 10),
    getTopCollections(req.userId, 10),
  ]);

  sendSuccess(res, {
    ...stats,
    topTags,
    topCollections,
  });
}

/**
 * Main handler
 */
async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void | VercelResponse> {
  const authHandler = withAuth(async (authReq, authRes) => {
    switch (authReq.method) {
      case "GET":
        return handleGet(authReq, authRes);
      default:
        authRes.setHeader("Allow", "GET");
        authRes.status(405).json({ error: "Method not allowed" });
    }
  });

  return authHandler(req as ApiRequest, res);
}

export default withErrorHandler(withRateLimit("api", handler));
