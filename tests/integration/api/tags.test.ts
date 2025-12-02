/**
 * Tags API Integration Tests (P10-006)
 *
 * Tests for tag CRUD operations.
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

vi.mock("@/lib/services/tags", () => ({
  getUserTagsWithCounts: vi.fn(),
  createTag: vi.fn(),
  getTagById: vi.fn(),
  getTagByName: vi.fn(),
  updateTag: vi.fn(),
  deleteTag: vi.fn(),
}));

// Mock rate limiting
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
import * as tagService from "@/lib/services/tags";

const mockGetSession = vi.mocked(auth.api.getSession);
const mockGetUserTagsWithCounts = vi.mocked(tagService.getUserTagsWithCounts);
const mockCreateTag = vi.mocked(tagService.createTag);
const mockGetTagById = vi.mocked(tagService.getTagById);
const mockGetTagByName = vi.mocked(tagService.getTagByName);
const mockUpdateTag = vi.mocked(tagService.updateTag);
const mockDeleteTag = vi.mocked(tagService.deleteTag);

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

describe("Tags API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/tags", () => {
    it("should return 401 when not authenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);

      const { default: handler } = await import("@api/tags/index");

      const req = createMockRequest({ method: "GET" });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(401);
    });

    it("should return tags list when authenticated", async () => {
      mockAuthenticatedSession();

      const mockTags = [
        {
          id: "tag-1",
          name: "javascript",
          color: "#F7DF1E",
          userId: "user-123",
          bookmarkCount: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "tag-2",
          name: "react",
          color: "#61DAFB",
          userId: "user-123",
          bookmarkCount: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockGetUserTagsWithCounts.mockResolvedValueOnce(mockTags);

      const { default: handler } = await import("@api/tags/index");

      const req = createMockRequest({ method: "GET" });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(200);
      expect(res._json).toEqual({
        success: true,
        data: mockTags,
        meta: undefined,
      });
    });
  });

  describe("POST /api/tags", () => {
    it("should return 401 when not authenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);

      const { default: handler } = await import("@api/tags/index");

      const req = createMockRequest({
        method: "POST",
        body: { name: "typescript" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(401);
    });

    it("should return 400 for invalid tag data", async () => {
      mockAuthenticatedSession();

      const { default: handler } = await import("@api/tags/index");

      const req = createMockRequest({
        method: "POST",
        body: { color: "invalid" }, // Missing required name
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

    it("should return 409 for duplicate tag name", async () => {
      mockAuthenticatedSession();
      mockGetTagByName.mockResolvedValueOnce({
        id: "existing-tag",
        name: "typescript",
        color: "#3178C6",
        userId: "user-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { default: handler } = await import("@api/tags/index");

      const req = createMockRequest({
        method: "POST",
        body: { name: "typescript" },
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

    it("should create tag successfully", async () => {
      mockAuthenticatedSession();
      mockGetTagByName.mockResolvedValueOnce(null);

      const newTag = {
        id: "new-tag-123",
        name: "typescript",
        color: "#3178C6",
        userId: "user-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateTag.mockResolvedValueOnce(newTag);

      const { default: handler } = await import("@api/tags/index");

      const req = createMockRequest({
        method: "POST",
        body: { name: "typescript", color: "#3178C6" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(201);
      expect(mockCreateTag).toHaveBeenCalledWith(
        "user-123",
        expect.objectContaining({
          name: "typescript",
        }),
      );
    });
  });

  describe("GET /api/tags/:id", () => {
    it("should return 401 when not authenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);

      const { default: handler } = await import("@api/tags/[id]");

      const req = createMockRequest({
        method: "GET",
        query: { id: "tag-123" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(401);
    });

    it("should return 404 when tag not found", async () => {
      mockAuthenticatedSession();
      mockGetTagById.mockResolvedValueOnce(null);

      const { default: handler } = await import("@api/tags/[id]");

      const req = createMockRequest({
        method: "GET",
        query: { id: "nonexistent" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(404);
    });

    it("should return tag when found", async () => {
      mockAuthenticatedSession();

      const mockTag = {
        id: "tag-123",
        name: "javascript",
        color: "#F7DF1E",
        userId: "user-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGetTagById.mockResolvedValueOnce(mockTag);

      const { default: handler } = await import("@api/tags/[id]");

      const req = createMockRequest({
        method: "GET",
        query: { id: "tag-123" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(200);
      expect(res._json).toEqual({
        success: true,
        data: mockTag,
        meta: undefined,
      });
    });
  });

  describe("PATCH /api/tags/:id", () => {
    it("should return 404 when tag not found", async () => {
      mockAuthenticatedSession();
      mockGetTagById.mockResolvedValueOnce(null);

      const { default: handler } = await import("@api/tags/[id]");

      const req = createMockRequest({
        method: "PATCH",
        query: { id: "nonexistent" },
        body: { name: "Updated Name" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(404);
    });

    it("should return 409 when renaming to duplicate name", async () => {
      mockAuthenticatedSession();

      const existingTag = {
        id: "tag-123",
        name: "old-name",
        color: "#FF0000",
        userId: "user-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const duplicateTag = {
        id: "other-tag",
        name: "duplicate",
        color: "#00FF00",
        userId: "user-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGetTagById.mockResolvedValueOnce(existingTag);
      mockGetTagByName.mockResolvedValueOnce(duplicateTag);

      const { default: handler } = await import("@api/tags/[id]");

      const req = createMockRequest({
        method: "PATCH",
        query: { id: "tag-123" },
        body: { name: "duplicate" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(409);
    });

    it("should update tag successfully", async () => {
      mockAuthenticatedSession();

      const existingTag = {
        id: "tag-123",
        name: "old-name",
        color: "#FF0000",
        userId: "user-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTag = {
        ...existingTag,
        name: "new-name",
      };

      mockGetTagById.mockResolvedValueOnce(existingTag);
      mockGetTagByName.mockResolvedValueOnce(null);
      mockUpdateTag.mockResolvedValueOnce(updatedTag);

      const { default: handler } = await import("@api/tags/[id]");

      const req = createMockRequest({
        method: "PATCH",
        query: { id: "tag-123" },
        body: { name: "new-name" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(200);
      expect(mockUpdateTag).toHaveBeenCalledWith(
        "tag-123",
        "user-123",
        expect.objectContaining({ name: "new-name" }),
      );
    });
  });

  describe("DELETE /api/tags/:id", () => {
    it("should return 404 when tag not found", async () => {
      mockAuthenticatedSession();
      mockGetTagById.mockResolvedValueOnce(null);

      const { default: handler } = await import("@api/tags/[id]");

      const req = createMockRequest({
        method: "DELETE",
        query: { id: "nonexistent" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(404);
    });

    it("should delete tag successfully", async () => {
      mockAuthenticatedSession();

      const tag = {
        id: "tag-123",
        name: "javascript",
        color: "#F7DF1E",
        userId: "user-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGetTagById.mockResolvedValueOnce(tag);
      mockDeleteTag.mockResolvedValueOnce(true);

      const { default: handler } = await import("@api/tags/[id]");

      const req = createMockRequest({
        method: "DELETE",
        query: { id: "tag-123" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(200);
      expect(mockDeleteTag).toHaveBeenCalledWith("tag-123", "user-123");
    });
  });

  describe("Method Not Allowed", () => {
    it("should return 405 for unsupported methods on index", async () => {
      mockAuthenticatedSession();

      const { default: handler } = await import("@api/tags/index");

      const req = createMockRequest({ method: "PUT" });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(405);
    });
  });
});
