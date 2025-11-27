/**
 * Export API Client (P5-012)
 *
 * Client for bookmark export operations.
 */

/**
 * Export format options
 */
export type ExportFormat = "html" | "json" | "csv";

/**
 * Export options
 */
export interface ExportOptions {
  format: ExportFormat;
  includeArchived?: boolean;
  categoryId?: string;
  collectionId?: string;
}

/**
 * Build export URL with parameters
 */
function buildExportUrl(options: ExportOptions): string {
  const params = new URLSearchParams();
  params.set("format", options.format);

  if (options.includeArchived) {
    params.set("includeArchived", "true");
  }
  if (options.categoryId) {
    params.set("categoryId", options.categoryId);
  }
  if (options.collectionId) {
    params.set("collectionId", options.collectionId);
  }

  return `/api/export?${params.toString()}`;
}

/**
 * Get content type for format
 */
function getContentType(format: ExportFormat): string {
  switch (format) {
    case "html":
      return "text/html";
    case "json":
      return "application/json";
    case "csv":
      return "text/csv";
  }
}

/**
 * Get file extension for format
 */
function getFileExtension(format: ExportFormat): string {
  switch (format) {
    case "html":
      return "html";
    case "json":
      return "json";
    case "csv":
      return "csv";
  }
}

/**
 * Export API client
 */
export const exportApi = {
  /**
   * Download bookmarks in specified format
   */
  async download(options: ExportOptions): Promise<void> {
    const url = buildExportUrl(options);

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    // Get the blob
    const blob = await response.blob();

    // Create download link
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `bookmind-export-${Date.now()}.${getFileExtension(options.format)}`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(downloadUrl);
  },

  /**
   * Get export preview (for UI display)
   */
  async preview(
    options: ExportOptions,
  ): Promise<{ data: string; contentType: string }> {
    const url = buildExportUrl(options);

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    const data = await response.text();

    return {
      data,
      contentType: getContentType(options.format),
    };
  },

  /**
   * Get export URL for external use
   */
  getUrl(options: ExportOptions): string {
    return buildExportUrl(options);
  },
};
