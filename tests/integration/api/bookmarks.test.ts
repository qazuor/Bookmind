/**
 * Bookmarks API Integration Tests (P10-006)
 *
 * Tests for bookmark CRUD operations.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiRequest } from "@/lib/api/types";

// Mock dependencies
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("@/lib/services/bookmarks", () => ({
  getBookmarks: vi.fn(),
  getBookmarkByUrl: vi.fn(),
  createBookmark: vi.fn(),
  getBookmark: vi.fn(),
  updateBookmark: vi.fn(),
  deleteBookmark: vi.fn(),
}));

// Mock rate limiting (no Redis in tests)
vi.mock("@upstash/redis", () => ({
  Redis: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: vi.fn().mockImplementation(() => ({
    limit: vi.fn().mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
    }),
  })),
}));

import { auth } from "@/lib/auth";
import * as bookmarkService from "@/lib/services/bookmarks";

const mockGetSession = vi.mocked(auth.api.getSession);
const mockGetBookmarks = vi.mocked(bookmarkService.getBookmarks);
const mockGetBookmarkByUrl = vi.mocked(bookmarkService.getBookmarkByUrl);
const mockCreateBookmark = vi.mocked(bookmarkService.createBookmark);

// Create mock request
function createMockRequest(overrides: Partial<VercelRequest> = {}): ApiRequest {
  return {
    method: "GET",
    headers: {},
    query: {},
    body: null,
    ...overrides,
  } as ApiRequest;
}

// Create mock response
function createMockResponse(): VercelResponse & {
  _status: number;
  _json: unknown;
} {
  const res = {
    _status: 200,
    _json: null as unknown,
    status: vi.fn().mockImplementation(function (
      this: VercelResponse & { _status: number },
      code: number,
    ) {
      this._status = code;
      return this;
    }),
    json: vi.fn().mockImplementation(function (
      this: VercelResponse & { _json: unknown },
      data: unknown,
    ) {
      this._json = data;
      return this;
    }),
    setHeader: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
  };
  return res as unknown as VercelResponse & {
    _status: number;
    _json: unknown;
  };
}

// Mock authenticated session
function mockAuthenticatedSession() {
  mockGetSession.mockResolvedValue({
    user: {
      id: "user-123",
      email: "test@example.com",
      name: "Test User",
      image: null,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      theme: "system",
      language: "en",
    },
    session: {
      id: "session-123",
      expiresAt: new Date(Date.now() + 86400000),
      userId: "user-123",
      token: "token-123",
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: null,
      userAgent: null,
    },
  });
}

describe("Bookmarks API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/bookmarks", () => {
    it("should return 401 when not authenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);

      // Dynamic import to get fresh module
      const { default: handler } = await import("@api/bookmarks/index");

      const req = createMockRequest({ method: "GET" });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(401);
    });

    it("should return bookmarks list when authenticated", async () => {
      mockAuthenticatedSession();

      const mockBookmarks = {
        data: [
          {
            id: "bookmark-1",
            url: "https://example.com",
            title: "Example",
            userId: "user-123",
            description: null,
            favicon: null,
            ogImage: null,
            ogTitle: null,
            ogDescription: null,
            aiSummary: null,
            aiTags: null,
            aiCategory: null,
            aiProcessedAt: null,
            notes: null,
            categoryId: null,
            isPublic: false,
            isArchived: false,
            isPinned: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1, hasMore: false },
      };

      mockGetBookmarks.mockResolvedValueOnce(mockBookmarks);

      const { default: handler } = await import("@api/bookmarks/index");

      const req = createMockRequest({ method: "GET" });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(200);
      expect(res._json).toEqual({
        success: true,
        data: mockBookmarks,
        meta: undefined,
      });
    });

    it("should pass query parameters to service", async () => {
      mockAuthenticatedSession();

      mockGetBookmarks.mockResolvedValueOnce({
        data: [],
        meta: { page: 2, limit: 10, total: 0, totalPages: 0, hasMore: false },
      });

      const { default: handler } = await import("@api/bookmarks/index");

      const req = createMockRequest({
        method: "GET",
        query: {
          page: "2",
          limit: "10",
          isArchived: "true",
        },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(mockGetBookmarks).toHaveBeenCalledWith(
        "user-123",
        expect.objectContaining({
          page: 2,
          limit: 10,
          isArchived: true,
        }),
      );
    });
  });

  describe("POST /api/bookmarks", () => {
    it("should return 401 when not authenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);

      const { default: handler } = await import("@api/bookmarks/index");

      const req = createMockRequest({
        method: "POST",
        body: { url: "https://example.com", title: "Example" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(401);
    });

    it("should return 400 for invalid bookmark data", async () => {
      mockAuthenticatedSession();

      const { default: handler } = await import("@api/bookmarks/index");

      const req = createMockRequest({
        method: "POST",
        body: { title: "No URL provided" }, // Missing required URL
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(400);
      expect(res._json).toEqual(
        expect.objectContaining({
          error: expect.objectContaining({
            code: "BAD_REQUEST",
          }),
        }),
      );
    });

    it("should return 409 for duplicate URL", async () => {
      mockAuthenticatedSession();
      mockGetBookmarkByUrl.mockResolvedValueOnce({
        id: "existing-bookmark",
        url: "https://example.com",
        title: "Existing",
        userId: "user-123",
        description: null,
        favicon: null,
        ogImage: null,
        ogTitle: null,
        ogDescription: null,
        aiSummary: null,
        aiTags: null,
        aiCategory: null,
        aiProcessedAt: null,
        notes: null,
        categoryId: null,
        isPublic: false,
        isArchived: false,
        isPinned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { default: handler } = await import("@api/bookmarks/index");

      const req = createMockRequest({
        method: "POST",
        body: { url: "https://example.com", title: "Duplicate" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(409);
      expect(res._json).toEqual(
        expect.objectContaining({
          error: expect.objectContaining({
            code: "CONFLICT",
          }),
        }),
      );
    });

    it("should create bookmark successfully", async () => {
      mockAuthenticatedSession();
      mockGetBookmarkByUrl.mockResolvedValueOnce(null);

      const newBookmark = {
        id: "new-bookmark-123",
        url: "https://example.com",
        title: "New Bookmark",
        userId: "user-123",
        description: null,
        favicon: null,
        ogImage: null,
        ogTitle: null,
        ogDescription: null,
        aiSummary: null,
        aiTags: null,
        aiCategory: null,
        aiProcessedAt: null,
        notes: null,
        categoryId: null,
        isPublic: false,
        isArchived: false,
        isPinned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateBookmark.mockResolvedValueOnce(newBookmark);

      const { default: handler } = await import("@api/bookmarks/index");

      const req = createMockRequest({
        method: "POST",
        body: { url: "https://example.com", title: "New Bookmark" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(201);
      expect(mockCreateBookmark).toHaveBeenCalledWith(
        "user-123",
        expect.objectContaining({
          url: "https://example.com",
          title: "New Bookmark",
        }),
      );
    });
  });

  describe("Method Not Allowed", () => {
    it("should return 405 for unsupported methods", async () => {
      mockAuthenticatedSession();

      const { default: handler } = await import("@api/bookmarks/index");

      const req = createMockRequest({ method: "PUT" });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(405);
    });
  });
});
