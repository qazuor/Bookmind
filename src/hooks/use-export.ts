/**
 * useExport Hook (P5-020)
 *
 * Hook for export operations with download helpers.
 */

import { useCallback, useState } from "react";
import {
  type ExportFormat,
  type ExportOptions,
  exportApi,
} from "@/lib/api-client";

/**
 * Export state
 */
interface ExportState {
  isExporting: boolean;
  error: Error | null;
  progress: number;
}

/**
 * Hook for export operations
 */
export function useExport() {
  const [state, setState] = useState<ExportState>({
    isExporting: false,
    error: null,
    progress: 0,
  });

  /**
   * Download bookmarks in specified format
   */
  const download = useCallback(async (options: ExportOptions) => {
    setState({ isExporting: true, error: null, progress: 0 });

    try {
      setState((prev) => ({ ...prev, progress: 50 }));
      await exportApi.download(options);
      setState((prev) => ({ ...prev, progress: 100 }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error("Export failed"),
      }));
      throw error;
    } finally {
      setState((prev) => ({ ...prev, isExporting: false }));
    }
  }, []);

  /**
   * Download as HTML (Netscape bookmark format)
   */
  const downloadHtml = useCallback(
    (includeArchived = false) => {
      return download({ format: "html", includeArchived });
    },
    [download],
  );

  /**
   * Download as JSON
   */
  const downloadJson = useCallback(
    (includeArchived = false) => {
      return download({ format: "json", includeArchived });
    },
    [download],
  );

  /**
   * Download as CSV
   */
  const downloadCsv = useCallback(
    (includeArchived = false) => {
      return download({ format: "csv", includeArchived });
    },
    [download],
  );

  /**
   * Get export preview
   */
  const getPreview = useCallback(async (format: ExportFormat) => {
    return exportApi.preview({ format });
  }, []);

  /**
   * Reset error state
   */
  const resetError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    download,
    downloadHtml,
    downloadJson,
    downloadCsv,
    getPreview,
    resetError,
  };
}
