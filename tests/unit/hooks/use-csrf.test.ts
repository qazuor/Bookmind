/**
 * useCsrfToken Hook Tests (P10-003)
 *
 * Tests for CSRF token management.
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCsrfToken, useCsrfToken } from "@/hooks/use-csrf";

// Mock the api-client
vi.mock("@/lib/api-client/fetch", () => ({
  apiGet: vi.fn(),
}));

import { apiGet } from "@/lib/api-client/fetch";

const mockApiGet = vi.mocked(apiGet);

describe("useCsrfToken", () => {
  const STORAGE_KEY = "csrf_token";

  beforeEach(() => {
    // Clear sessionStorage
    sessionStorage.clear();
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("should return null token initially when no token stored", async () => {
    mockApiGet.mockResolvedValueOnce({ token: "new-token" });

    const { result } = renderHook(() => useCsrfToken());

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.token).toBeNull();

    // Wait for fetch to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.token).toBe("new-token");
  });

  it("should return stored token if available", () => {
    sessionStorage.setItem(STORAGE_KEY, "stored-token");

    const { result } = renderHook(() => useCsrfToken());

    expect(result.current.token).toBe("stored-token");
  });

  it("should fetch new token if none stored", async () => {
    mockApiGet.mockResolvedValueOnce({ token: "fetched-token" });

    const { result } = renderHook(() => useCsrfToken());

    await waitFor(() => {
      expect(result.current.token).toBe("fetched-token");
    });

    expect(mockApiGet).toHaveBeenCalledWith("/csrf-token");
    expect(sessionStorage.getItem(STORAGE_KEY)).toBe("fetched-token");
  });

  it("should handle fetch errors", async () => {
    mockApiGet.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useCsrfToken());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Network error");
    expect(result.current.token).toBeNull();
  });

  it("should refresh token when refreshToken is called", async () => {
    sessionStorage.setItem(STORAGE_KEY, "old-token");
    mockApiGet.mockResolvedValueOnce({ token: "new-token" });

    const { result } = renderHook(() => useCsrfToken());

    expect(result.current.token).toBe("old-token");

    // Call refresh and wait for state update
    await act(async () => {
      await result.current.refreshToken();
    });

    expect(result.current.token).toBe("new-token");
    expect(sessionStorage.getItem(STORAGE_KEY)).toBe("new-token");
  });

  it("should clear token when clear is called", async () => {
    sessionStorage.setItem(STORAGE_KEY, "stored-token");

    const { result } = renderHook(() => useCsrfToken());

    expect(result.current.token).toBe("stored-token");

    // Call clear and wait for state update
    act(() => {
      result.current.clear();
    });

    expect(result.current.token).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("should handle non-Error exceptions in fetch", async () => {
    mockApiGet.mockRejectedValueOnce("string error");

    const { result } = renderHook(() => useCsrfToken());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error?.message).toBe("Failed to fetch CSRF token");
  });

  it("should return new token from refreshToken", async () => {
    mockApiGet.mockResolvedValueOnce({ token: "refresh-token" });

    const { result } = renderHook(() => useCsrfToken());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockApiGet.mockResolvedValueOnce({ token: "second-refresh-token" });

    let returnedToken: string | null = null;
    await act(async () => {
      returnedToken = await result.current.refreshToken();
    });

    expect(returnedToken).toBe("second-refresh-token");
  });

  it("should return null from refreshToken on error", async () => {
    sessionStorage.setItem(STORAGE_KEY, "existing-token");
    mockApiGet.mockRejectedValueOnce(new Error("Fetch failed"));

    const { result } = renderHook(() => useCsrfToken());

    let returnedToken: string | null = "initial";
    await act(async () => {
      returnedToken = await result.current.refreshToken();
    });

    expect(returnedToken).toBeNull();
    expect(result.current.error).not.toBeNull();
  });
});

describe("getCsrfToken", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("should return stored token", () => {
    sessionStorage.setItem("csrf_token", "test-token");

    expect(getCsrfToken()).toBe("test-token");
  });

  it("should return null if no token stored", () => {
    expect(getCsrfToken()).toBeNull();
  });
});
