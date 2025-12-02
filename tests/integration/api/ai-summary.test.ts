/**
 * AI Summary API Integration Tests (P10-007)
 *
 * Tests for AI-powered bookmark summary generation.
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

// Mock db interface for type safety
interface MockDbInterface {
  select: ReturnType<typeof vi.fn>;
  from: ReturnType<typeof vi.fn>;
  where: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
}

const mockDbInstance: MockDbInterface = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn(),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
};

vi.mock("@/lib/db", () => ({
  db: mockDbInstance,
}));

vi.mock("@/lib/ai", () => ({
  generateSummary: vi.fn(),
  AIError: class AIError extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
    }
  },
}));

// Mock rate limiting
vi.mock("@upstash/redis", () => ({
  Redis: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: vi.fn().mockImplementation(() => ({
    limit: vi.fn().mockResolvedValue({
      success: true,
      limit: 20,
      remaining: 19,
      reset: Date.now() + 60000,
    }),
  })),
}));

import * as aiModule from "@/lib/ai";
import { auth } from "@/lib/auth";

const mockGetSession = vi.mocked(auth.api.getSession);
const mockGenerateSummary = vi.mocked(aiModule.generateSummary);

// Create mock request
function createMockRequest(overrides: Partial<VercelRequest> = {}): ApiRequest {
  return {
    method: "POST",
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

describe("AI Summary API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/bookmarks/:id/ai/summary", () => {
    it("should return 401 when not authenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);

      const { default: handler } = await import(
        "@api/bookmarks/[id]/ai/summary"
      );

      const req = createMockRequest({
        method: "POST",
        query: { id: "bookmark-123" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(401);
    });

    it("should return 400 when bookmark ID is missing", async () => {
      mockAuthenticatedSession();

      const { default: handler } = await import(
        "@api/bookmarks/[id]/ai/summary"
      );

      const req = createMockRequest({
        method: "POST",
        query: {},
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(400);
    });

    it("should return 404 when bookmark not found", async () => {
      mockAuthenticatedSession();
      mockDbInstance.limit.mockResolvedValueOnce([]);

      const { default: handler } = await import(
        "@api/bookmarks/[id]/ai/summary"
      );

      const req = createMockRequest({
        method: "POST",
        query: { id: "nonexistent" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(404);
    });

    it("should return 403 when user is not bookmark owner", async () => {
      mockAuthenticatedSession();
      mockDbInstance.limit.mockResolvedValueOnce([
        {
          id: "bookmark-123",
          userId: "other-user",
          title: "Test Bookmark",
          url: "https://example.com",
          description: "A test bookmark",
        },
      ]);

      const { default: handler } = await import(
        "@api/bookmarks/[id]/ai/summary"
      );

      const req = createMockRequest({
        method: "POST",
        query: { id: "bookmark-123" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(403);
    });

    it("should generate summary successfully", async () => {
      mockAuthenticatedSession();
      mockDbInstance.limit.mockResolvedValueOnce([
        {
          id: "bookmark-123",
          userId: "user-123",
          title: "Test Bookmark",
          url: "https://example.com",
          description: "A test bookmark",
        },
      ]);

      mockGenerateSummary.mockResolvedValueOnce({
        summary: "This is an AI-generated summary of the bookmark.",
        tokensUsed: 150,
      });

      const { default: handler } = await import(
        "@api/bookmarks/[id]/ai/summary"
      );

      const req = createMockRequest({
        method: "POST",
        query: { id: "bookmark-123" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(200);
      expect(mockGenerateSummary).toHaveBeenCalledWith("user-123", {
        title: "Test Bookmark",
        url: "https://example.com",
        description: "A test bookmark",
      });
    });

    it("should handle AI rate limit error", async () => {
      mockAuthenticatedSession();
      mockDbInstance.limit.mockResolvedValueOnce([
        {
          id: "bookmark-123",
          userId: "user-123",
          title: "Test Bookmark",
          url: "https://example.com",
          description: null,
        },
      ]);

      const { AIError } = await import("@/lib/ai");
      mockGenerateSummary.mockRejectedValueOnce(
        new AIError("Rate limit exceeded", "RATE_LIMITED"),
      );

      const { default: handler } = await import(
        "@api/bookmarks/[id]/ai/summary"
      );

      const req = createMockRequest({
        method: "POST",
        query: { id: "bookmark-123" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(400);
    });

    it("should return 405 for unsupported methods", async () => {
      mockAuthenticatedSession();

      const { default: handler } = await import(
        "@api/bookmarks/[id]/ai/summary"
      );

      const req = createMockRequest({
        method: "GET",
        query: { id: "bookmark-123" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(405);
    });
  });
});
