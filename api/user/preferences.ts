/**
 * User Preferences API
 *
 * GET /api/user/preferences - Get current user's preferences
 * PATCH /api/user/preferences - Update current user's preferences
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withAuth } from "../../src/lib/api/auth";
import {
  BadRequestError,
  NotFoundError,
  sendError,
  sendSuccess,
} from "../../src/lib/api/errors";
import { withErrorHandler, withRateLimit } from "../../src/lib/api/index";
import type { ApiRequest } from "../../src/lib/api/types";
import {
  getUserById,
  updateUserPreferences,
} from "../../src/lib/services/users";
import { userPreferencesSchema } from "../../src/schemas/user.schema";

/**
 * GET /api/user/preferences
 * Get current user's preferences
 */
async function handleGet(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
): Promise<void> {
  const user = await getUserById(req.userId);

  if (!user) {
    sendError(res, new NotFoundError("User"));
    return;
  }

  sendSuccess(res, {
    language: user.language,
    theme: user.theme,
    defaultVisibility: user.defaultVisibility,
    emailNotifications: user.emailNotifications,
  });
}

/**
 * PATCH /api/user/preferences
 * Update current user's preferences
 */
async function handlePatch(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
): Promise<void> {
  // Validate request body
  const result = userPreferencesSchema.safeParse(req.body);
  if (!result.success) {
    sendError(
      res,
      new BadRequestError("Invalid preferences data", {
        errors: result.error.issues,
      }),
    );
    return;
  }

  const updated = await updateUserPreferences(req.userId, result.data);

  if (!updated) {
    sendError(res, new NotFoundError("User"));
    return;
  }

  sendSuccess(res, {
    language: updated.language,
    theme: updated.theme,
    defaultVisibility: updated.defaultVisibility,
    emailNotifications: updated.emailNotifications,
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
      case "PATCH":
        return handlePatch(authReq, authRes);
      default:
        authRes.setHeader("Allow", "GET, PATCH");
        authRes.status(405).json({ error: "Method not allowed" });
    }
  });

  return authHandler(req as ApiRequest, res);
}

export default withErrorHandler(withRateLimit("api", handler));
