/**
 * Collections API Integration Tests (P10-006)
 *
 * Tests for collection CRUD operations.
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

vi.mock("@/lib/services/collections", () => ({
  getUserCollectionsWithCounts: vi.fn(),
  getCollectionTree: vi.fn(),
  createCollection: vi.fn(),
  getCollectionById: vi.fn(),
  getCollectionByName: vi.fn(),
  updateCollection: vi.fn(),
  deleteCollection: vi.fn(),
  validateParentCollection: vi.fn(),
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
import * as collectionService from "@/lib/services/collections";

const mockGetSession = vi.mocked(auth.api.getSession);
const mockGetUserCollectionsWithCounts = vi.mocked(
  collectionService.getUserCollectionsWithCounts,
);
const mockGetCollectionTree = vi.mocked(collectionService.getCollectionTree);
const mockCreateCollection = vi.mocked(collectionService.createCollection);
const mockGetCollectionByName = vi.mocked(
  collectionService.getCollectionByName,
);
const mockValidateParentCollection = vi.mocked(
  collectionService.validateParentCollection,
);

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

describe("Collections API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/collections", () => {
    it("should return 401 when not authenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);

      const { default: handler } = await import("@api/collections/index");

      const req = createMockRequest({ method: "GET" });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(401);
    });

    it("should return collections list when authenticated", async () => {
      mockAuthenticatedSession();

      const mockCollections = [
        {
          id: "col-1",
          name: "Reading List",
          description: "Books to read",
          userId: "user-123",
          bookmarkCount: 10,
          isPublic: false,
          parentId: null,
          shareToken: null,
          shareExpiresAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "col-2",
          name: "Tutorials",
          description: "Coding tutorials",
          userId: "user-123",
          bookmarkCount: 5,
          isPublic: false,
          parentId: null,
          shareToken: null,
          shareExpiresAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockGetUserCollectionsWithCounts.mockResolvedValueOnce(mockCollections);

      const { default: handler } = await import("@api/collections/index");

      const req = createMockRequest({ method: "GET" });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(200);
      expect(res._json).toEqual({
        success: true,
        data: mockCollections,
        meta: undefined,
      });
    });

    it("should return collection tree when tree=true", async () => {
      mockAuthenticatedSession();

      const mockTree = [
        {
          id: "col-1",
          name: "Parent",
          parentId: null,
          bookmarkCount: 5,
          children: [
            {
              id: "col-2",
              name: "Child",
              parentId: "col-1",
              bookmarkCount: 2,
              children: [],
            },
          ],
        },
      ];

      mockGetCollectionTree.mockResolvedValueOnce(mockTree);

      const { default: handler } = await import("@api/collections/index");

      const req = createMockRequest({
        method: "GET",
        query: { tree: "true" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(200);
      expect(mockGetCollectionTree).toHaveBeenCalledWith("user-123");
    });
  });

  describe("POST /api/collections", () => {
    it("should return 401 when not authenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);

      const { default: handler } = await import("@api/collections/index");

      const req = createMockRequest({
        method: "POST",
        body: { name: "New Collection" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(401);
    });

    it("should return 400 for invalid collection data", async () => {
      mockAuthenticatedSession();

      const { default: handler } = await import("@api/collections/index");

      const req = createMockRequest({
        method: "POST",
        body: { description: "Missing name" },
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

    it("should return 400 when parent collection not found", async () => {
      mockAuthenticatedSession();
      mockValidateParentCollection.mockResolvedValueOnce(false);

      const { default: handler } = await import("@api/collections/index");

      const req = createMockRequest({
        method: "POST",
        body: { name: "Child Collection", parentId: "nonexistent" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(400);
    });

    it("should return 409 for duplicate collection name", async () => {
      mockAuthenticatedSession();
      mockGetCollectionByName.mockResolvedValueOnce({
        id: "existing-col",
        name: "Duplicate",
        userId: "user-123",
        description: null,
        isPublic: false,
        parentId: null,
        shareToken: null,
        shareExpiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { default: handler } = await import("@api/collections/index");

      const req = createMockRequest({
        method: "POST",
        body: { name: "Duplicate" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(409);
    });

    it("should create collection successfully", async () => {
      mockAuthenticatedSession();
      mockGetCollectionByName.mockResolvedValueOnce(null);

      const newCollection = {
        id: "new-col-123",
        name: "New Collection",
        description: "A new collection",
        userId: "user-123",
        isPublic: false,
        parentId: null,
        shareToken: null,
        shareExpiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateCollection.mockResolvedValueOnce(newCollection);

      const { default: handler } = await import("@api/collections/index");

      const req = createMockRequest({
        method: "POST",
        body: { name: "New Collection", description: "A new collection" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(201);
      expect(mockCreateCollection).toHaveBeenCalledWith(
        "user-123",
        expect.objectContaining({
          name: "New Collection",
          description: "A new collection",
        }),
      );
    });
  });

  describe("Method Not Allowed", () => {
    it("should return 405 for unsupported methods", async () => {
      mockAuthenticatedSession();

      const { default: handler } = await import("@api/collections/index");

      const req = createMockRequest({ method: "PUT" });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(405);
    });
  });
});
