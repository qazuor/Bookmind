/**
 * useExport Hook Tests (P10-003)
 *
 * Tests for export operations.
 */

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useExport } from "@/hooks/use-export";

// Mock the api-client
const mockDownload = vi.fn();
const mockPreview = vi.fn();

vi.mock("@/lib/api-client", () => ({
  exportApi: {
    download: (...args: unknown[]) => mockDownload(...args),
    preview: (...args: unknown[]) => mockPreview(...args),
  },
}));

describe("useExport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDownload.mockReset();
    mockPreview.mockReset();
  });

  it("should have initial state", () => {
    const { result } = renderHook(() => useExport());

    expect(result.current.isExporting).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.progress).toBe(0);
  });

  it("should download with options", async () => {
    mockDownload.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useExport());

    await act(async () => {
      await result.current.download({ format: "json", includeArchived: true });
    });

    expect(mockDownload).toHaveBeenCalledWith({
      format: "json",
      includeArchived: true,
    });
    expect(result.current.isExporting).toBe(false);
    expect(result.current.progress).toBe(100);
  });

  it("should handle download errors", async () => {
    const error = new Error("Download failed");
    mockDownload.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useExport());

    let thrownError: Error | null = null;
    await act(async () => {
      try {
        await result.current.download({ format: "json" });
      } catch (e) {
        thrownError = e as Error;
      }
    });

    expect((thrownError as Error | null)?.message).toBe("Download failed");
    expect(result.current.error?.message).toBe("Download failed");
    expect(result.current.isExporting).toBe(false);
  });

  it("should handle non-Error exceptions", async () => {
    mockDownload.mockRejectedValueOnce("string error");

    const { result } = renderHook(() => useExport());

    let thrownError: unknown = null;
    await act(async () => {
      try {
        await result.current.download({ format: "json" });
      } catch (e) {
        thrownError = e;
      }
    });

    expect(thrownError).toBe("string error");
    expect(result.current.error?.message).toBe("Export failed");
  });

  describe("downloadHtml", () => {
    it("should download as HTML without archived", async () => {
      mockDownload.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useExport());

      await act(async () => {
        await result.current.downloadHtml();
      });

      expect(mockDownload).toHaveBeenCalledWith({
        format: "html",
        includeArchived: false,
      });
    });

    it("should download as HTML with archived", async () => {
      mockDownload.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useExport());

      await act(async () => {
        await result.current.downloadHtml(true);
      });

      expect(mockDownload).toHaveBeenCalledWith({
        format: "html",
        includeArchived: true,
      });
    });
  });

  describe("downloadJson", () => {
    it("should download as JSON without archived", async () => {
      mockDownload.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useExport());

      await act(async () => {
        await result.current.downloadJson();
      });

      expect(mockDownload).toHaveBeenCalledWith({
        format: "json",
        includeArchived: false,
      });
    });

    it("should download as JSON with archived", async () => {
      mockDownload.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useExport());

      await act(async () => {
        await result.current.downloadJson(true);
      });

      expect(mockDownload).toHaveBeenCalledWith({
        format: "json",
        includeArchived: true,
      });
    });
  });

  describe("downloadCsv", () => {
    it("should download as CSV without archived", async () => {
      mockDownload.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useExport());

      await act(async () => {
        await result.current.downloadCsv();
      });

      expect(mockDownload).toHaveBeenCalledWith({
        format: "csv",
        includeArchived: false,
      });
    });

    it("should download as CSV with archived", async () => {
      mockDownload.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useExport());

      await act(async () => {
        await result.current.downloadCsv(true);
      });

      expect(mockDownload).toHaveBeenCalledWith({
        format: "csv",
        includeArchived: true,
      });
    });
  });

  describe("getPreview", () => {
    it("should get export preview", async () => {
      const previewData = {
        preview: "preview content",
        count: 10,
      };
      mockPreview.mockResolvedValueOnce(previewData);

      const { result } = renderHook(() => useExport());

      let preview: unknown;
      await act(async () => {
        preview = await result.current.getPreview("json");
      });

      expect(mockPreview).toHaveBeenCalledWith({ format: "json" });
      expect(preview).toEqual(previewData);
    });
  });

  describe("resetError", () => {
    it("should reset error state", async () => {
      mockDownload.mockRejectedValueOnce(new Error("Test error"));

      const { result } = renderHook(() => useExport());

      // Trigger an error
      await act(async () => {
        try {
          await result.current.download({ format: "json" });
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).not.toBeNull();

      // Reset error
      act(() => {
        result.current.resetError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
