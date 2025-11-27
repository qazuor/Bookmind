/**
 * Export Service
 *
 * Generate bookmark exports in various formats (HTML, JSON, CSV).
 */

import type { BookmarkWithRelations } from "./bookmarks";

/**
 * Export options
 */
export interface ExportOptions {
  format: "html" | "json" | "csv";
  includeArchived?: boolean;
  includeNotes?: boolean;
  categoryId?: string;
  collectionId?: string;
  tagIds?: string[];
}

/**
 * Generate HTML export (Netscape Bookmark Format)
 */
export function generateHtmlExport(bookmarks: BookmarkWithRelations[]): string {
  const header = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>`;

  const footer = "</DL><p>";

  // Group bookmarks by category
  const byCategory = new Map<string, BookmarkWithRelations[]>();
  const uncategorized: BookmarkWithRelations[] = [];

  for (const bookmark of bookmarks) {
    if (bookmark.category) {
      const categoryName = bookmark.category.name;
      if (!byCategory.has(categoryName)) {
        byCategory.set(categoryName, []);
      }
      byCategory.get(categoryName)!.push(bookmark);
    } else {
      uncategorized.push(bookmark);
    }
  }

  let body = "";

  // Add categorized bookmarks
  for (const [categoryName, categoryBookmarks] of byCategory) {
    body += `    <DT><H3>${escapeHtml(categoryName)}</H3>\n`;
    body += "    <DL><p>\n";

    for (const bookmark of categoryBookmarks) {
      body += formatBookmarkHtml(bookmark);
    }

    body += "    </DL><p>\n";
  }

  // Add uncategorized bookmarks
  if (uncategorized.length > 0) {
    body += "    <DT><H3>Uncategorized</H3>\n";
    body += "    <DL><p>\n";

    for (const bookmark of uncategorized) {
      body += formatBookmarkHtml(bookmark);
    }

    body += "    </DL><p>\n";
  }

  return `${header}\n${body}${footer}`;
}

/**
 * Format a single bookmark as HTML
 */
function formatBookmarkHtml(bookmark: BookmarkWithRelations): string {
  const timestamp = Math.floor(bookmark.createdAt.getTime() / 1000);
  const tags = bookmark.tags?.map((t) => t.name).join(",") ?? "";

  let html = `        <DT><A HREF="${escapeHtml(bookmark.url)}" ADD_DATE="${timestamp}"`;

  if (tags) {
    html += ` TAGS="${escapeHtml(tags)}"`;
  }

  html += `>${escapeHtml(bookmark.title)}</A>\n`;

  if (bookmark.description) {
    html += `        <DD>${escapeHtml(bookmark.description)}\n`;
  }

  return html;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generate JSON export
 */
export function generateJsonExport(
  bookmarks: BookmarkWithRelations[],
  includeNotes = true,
): string {
  const exportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    count: bookmarks.length,
    bookmarks: bookmarks.map((bookmark) => ({
      url: bookmark.url,
      title: bookmark.title,
      description: bookmark.description,
      notes: includeNotes ? bookmark.notes : undefined,
      favicon: bookmark.favicon,
      ogImage: bookmark.ogImage,
      category: bookmark.category?.name ?? null,
      tags: bookmark.tags?.map((t) => t.name) ?? [],
      collections: bookmark.collections?.map((c) => c.name) ?? [],
      isPublic: bookmark.isPublic,
      isPinned: bookmark.isPinned,
      isArchived: bookmark.isArchived,
      aiSummary: bookmark.aiSummary,
      createdAt: bookmark.createdAt.toISOString(),
      updatedAt: bookmark.updatedAt.toISOString(),
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Generate CSV export
 */
export function generateCsvExport(
  bookmarks: BookmarkWithRelations[],
  includeNotes = true,
): string {
  const headers = [
    "url",
    "title",
    "description",
    ...(includeNotes ? ["notes"] : []),
    "category",
    "tags",
    "collections",
    "isPublic",
    "isPinned",
    "isArchived",
    "createdAt",
    "updatedAt",
  ];

  const rows = bookmarks.map((bookmark) => [
    escapeCsv(bookmark.url),
    escapeCsv(bookmark.title),
    escapeCsv(bookmark.description ?? ""),
    ...(includeNotes ? [escapeCsv(bookmark.notes ?? "")] : []),
    escapeCsv(bookmark.category?.name ?? ""),
    escapeCsv(bookmark.tags?.map((t) => t.name).join("; ") ?? ""),
    escapeCsv(bookmark.collections?.map((c) => c.name).join("; ") ?? ""),
    bookmark.isPublic ? "true" : "false",
    bookmark.isPinned ? "true" : "false",
    bookmark.isArchived ? "true" : "false",
    bookmark.createdAt.toISOString(),
    bookmark.updatedAt.toISOString(),
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

/**
 * Escape CSV field
 */
function escapeCsv(str: string): string {
  if (!str) return '""';

  // Escape quotes by doubling them
  const escaped = str.replace(/"/g, '""');

  // Wrap in quotes if contains comma, newline, or quote
  if (
    escaped.includes(",") ||
    escaped.includes("\n") ||
    escaped.includes('"')
  ) {
    return `"${escaped}"`;
  }

  return `"${escaped}"`;
}

/**
 * Get MIME type for export format
 */
export function getExportMimeType(format: "html" | "json" | "csv"): string {
  switch (format) {
    case "html":
      return "text/html";
    case "json":
      return "application/json";
    case "csv":
      return "text/csv";
    default:
      return "application/octet-stream";
  }
}

/**
 * Get file extension for export format
 */
export function getExportExtension(format: "html" | "json" | "csv"): string {
  switch (format) {
    case "html":
      return "html";
    case "json":
      return "json";
    case "csv":
      return "csv";
    default:
      return "txt";
  }
}
