/**
 * User Profile API
 *
 * GET /api/user/profile - Get current user's profile
 * PATCH /api/user/profile - Update current user's profile
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withAuth } from "../../src/lib/api/auth";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  sendError,
  sendSuccess,
} from "../../src/lib/api/errors";
import { withErrorHandler, withRateLimit } from "../../src/lib/api/index";
import type { ApiRequest } from "../../src/lib/api/types";
import {
  getUserById,
  isUsernameAvailable,
  updateUserProfile,
} from "../../src/lib/services/users";
import { updateProfileSchema } from "../../src/schemas/user.schema";

/**
 * GET /api/user/profile
 * Get current user's profile
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

  // Return profile without sensitive data
  sendSuccess(res, {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    name: user.name,
    username: user.username,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    language: user.language,
    theme: user.theme,
    defaultVisibility: user.defaultVisibility,
    emailNotifications: user.emailNotifications,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}

/**
 * PATCH /api/user/profile
 * Update current user's profile
 */
async function handlePatch(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
): Promise<void> {
  // Validate request body
  const result = updateProfileSchema.safeParse(req.body);
  if (!result.success) {
    sendError(
      res,
      new BadRequestError("Invalid profile data", {
        errors: result.error.issues,
      }),
    );
    return;
  }

  // Check username availability if being changed
  if (result.data.username) {
    const available = await isUsernameAvailable(
      result.data.username,
      req.userId,
    );
    if (!available) {
      sendError(res, new ConflictError("Username is already taken"));
      return;
    }
  }

  const updated = await updateUserProfile(req.userId, result.data);

  if (!updated) {
    sendError(res, new NotFoundError("User"));
    return;
  }

  // Return updated profile without sensitive data
  sendSuccess(res, {
    id: updated.id,
    email: updated.email,
    emailVerified: updated.emailVerified,
    name: updated.name,
    username: updated.username,
    bio: updated.bio,
    avatarUrl: updated.avatarUrl,
    language: updated.language,
    theme: updated.theme,
    defaultVisibility: updated.defaultVisibility,
    emailNotifications: updated.emailNotifications,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
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
