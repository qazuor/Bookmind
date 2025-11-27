/**
 * Export API
 *
 * GET /api/export?format=html|json|csv - Export bookmarks
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withAuth } from "../../src/lib/api/auth";
import { BadRequestError, sendError } from "../../src/lib/api/errors";
import { withErrorHandler, withRateLimit } from "../../src/lib/api/index";
import type { ApiRequest } from "../../src/lib/api/types";
import { getBookmarks } from "../../src/lib/services/bookmarks";
import {
  generateCsvExport,
  generateHtmlExport,
  generateJsonExport,
  getExportExtension,
  getExportMimeType,
} from "../../src/lib/services/export";
import { exportOptionsSchema } from "../../src/schemas/export.schema";

/**
 * GET /api/export
 * Export bookmarks in the requested format
 */
async function handleGet(
  req: ApiRequest & { userId: string },
  res: VercelResponse,
): Promise<void> {
  // Parse and validate query params
  const queryInput = {
    format: req.query.format ?? "json",
    includeArchived: req.query.includeArchived === "true",
    includeNotes: req.query.includeNotes !== "false", // Default true
    categoryId: req.query.categoryId,
    collectionId: req.query.collectionId,
    tagIds: req.query.tagIds
      ? Array.isArray(req.query.tagIds)
        ? req.query.tagIds
        : [req.query.tagIds]
      : undefined,
  };

  const result = exportOptionsSchema.safeParse(queryInput);
  if (!result.success) {
    sendError(
      res,
      new BadRequestError("Invalid export options", {
        errors: result.error.issues,
      }),
    );
    return;
  }

  const {
    format,
    includeArchived,
    includeNotes,
    categoryId,
    collectionId,
    tagIds,
  } = result.data;

  // Fetch all bookmarks with filters (no pagination for export)
  const { data: bookmarks } = await getBookmarks(req.userId, {
    categoryId,
    collectionId,
    tagIds,
    isArchived: includeArchived ? undefined : false, // Exclude archived by default
    page: 1,
    limit: 10000, // Large limit for export
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Generate export content
  let content: string;
  switch (format) {
    case "html":
      content = generateHtmlExport(bookmarks);
      break;
    case "csv":
      content = generateCsvExport(bookmarks, includeNotes);
      break;
    default:
      content = generateJsonExport(bookmarks, includeNotes);
      break;
  }

  // Set response headers for file download
  const filename = `bookmind-export-${new Date().toISOString().split("T")[0]}.${getExportExtension(format)}`;
  const mimeType = getExportMimeType(format);

  res.setHeader("Content-Type", mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(content);
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

export default withErrorHandler(withRateLimit("export", handler));
