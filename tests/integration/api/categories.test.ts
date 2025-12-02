/**
 * Categories API Integration Tests (P10-006)
 *
 * Tests for category CRUD operations.
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

vi.mock("@/lib/services/categories", () => ({
  getUserCategoriesWithCounts: vi.fn(),
  createCategory: vi.fn(),
  getCategoryById: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
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
import * as categoryService from "@/lib/services/categories";

const mockGetSession = vi.mocked(auth.api.getSession);
const mockGetUserCategoriesWithCounts = vi.mocked(
  categoryService.getUserCategoriesWithCounts,
);
const mockCreateCategory = vi.mocked(categoryService.createCategory);
const mockGetCategoryById = vi.mocked(categoryService.getCategoryById);
const mockUpdateCategory = vi.mocked(categoryService.updateCategory);
const mockDeleteCategory = vi.mocked(categoryService.deleteCategory);

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

describe("Categories API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/categories", () => {
    it("should return 401 when not authenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);

      const { default: handler } = await import("@api/categories/index");

      const req = createMockRequest({ method: "GET" });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(401);
    });

    it("should return categories list when authenticated", async () => {
      mockAuthenticatedSession();

      const mockCategories = [
        {
          id: "cat-1",
          name: "Work",
          color: "#FF0000",
          icon: "briefcase",
          userId: "user-123",
          bookmarkCount: 5,
          description: null,
          isDefault: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "cat-2",
          name: "Personal",
          color: "#00FF00",
          icon: "home",
          userId: "user-123",
          bookmarkCount: 3,
          description: null,
          isDefault: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockGetUserCategoriesWithCounts.mockResolvedValueOnce(mockCategories);

      const { default: handler } = await import("@api/categories/index");

      const req = createMockRequest({ method: "GET" });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(200);
      expect(res._json).toEqual({
        success: true,
        data: mockCategories,
        meta: undefined,
      });
    });
  });

  describe("POST /api/categories", () => {
    it("should return 401 when not authenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);

      const { default: handler } = await import("@api/categories/index");

      const req = createMockRequest({
        method: "POST",
        body: { name: "New Category" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(401);
    });

    it("should return 400 for invalid category data", async () => {
      mockAuthenticatedSession();

      const { default: handler } = await import("@api/categories/index");

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

    it("should create category successfully", async () => {
      mockAuthenticatedSession();

      const newCategory = {
        id: "new-cat-123",
        name: "New Category",
        color: "#0000FF",
        icon: "folder",
        userId: "user-123",
        isDefault: false,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateCategory.mockResolvedValueOnce(newCategory);

      const { default: handler } = await import("@api/categories/index");

      const req = createMockRequest({
        method: "POST",
        body: { name: "New Category", color: "#0000FF", icon: "folder" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(201);
      expect(mockCreateCategory).toHaveBeenCalledWith(
        "user-123",
        expect.objectContaining({
          name: "New Category",
          color: "#0000FF",
          icon: "folder",
        }),
      );
    });
  });

  describe("GET /api/categories/:id", () => {
    it("should return 401 when not authenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);

      const { default: handler } = await import("@api/categories/[id]");

      const req = createMockRequest({
        method: "GET",
        query: { id: "cat-123" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(401);
    });

    it("should return 404 when category not found", async () => {
      mockAuthenticatedSession();
      mockGetCategoryById.mockResolvedValueOnce(null);

      const { default: handler } = await import("@api/categories/[id]");

      const req = createMockRequest({
        method: "GET",
        query: { id: "nonexistent" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(404);
      expect(res._json).toEqual(
        expect.objectContaining({
          error: expect.objectContaining({
            code: "NOT_FOUND",
          }),
        }),
      );
    });

    it("should return category when found", async () => {
      mockAuthenticatedSession();

      const mockCategory = {
        id: "cat-123",
        name: "Work",
        color: "#FF0000",
        icon: "briefcase",
        userId: "user-123",
        isDefault: false,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGetCategoryById.mockResolvedValueOnce(mockCategory);

      const { default: handler } = await import("@api/categories/[id]");

      const req = createMockRequest({
        method: "GET",
        query: { id: "cat-123" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(200);
      expect(res._json).toEqual({
        success: true,
        data: mockCategory,
        meta: undefined,
      });
    });
  });

  describe("PATCH /api/categories/:id", () => {
    it("should return 404 when category not found", async () => {
      mockAuthenticatedSession();
      mockGetCategoryById.mockResolvedValueOnce(null);

      const { default: handler } = await import("@api/categories/[id]");

      const req = createMockRequest({
        method: "PATCH",
        query: { id: "nonexistent" },
        body: { name: "Updated Name" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(404);
    });

    it("should update category successfully", async () => {
      mockAuthenticatedSession();

      const existingCategory = {
        id: "cat-123",
        name: "Old Name",
        color: "#FF0000",
        icon: "briefcase",
        userId: "user-123",
        isDefault: false,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedCategory = {
        ...existingCategory,
        name: "New Name",
      };

      mockGetCategoryById.mockResolvedValueOnce(existingCategory);
      mockUpdateCategory.mockResolvedValueOnce(updatedCategory);

      const { default: handler } = await import("@api/categories/[id]");

      const req = createMockRequest({
        method: "PATCH",
        query: { id: "cat-123" },
        body: { name: "New Name" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(200);
      expect(mockUpdateCategory).toHaveBeenCalledWith(
        "cat-123",
        "user-123",
        expect.objectContaining({ name: "New Name" }),
      );
    });
  });

  describe("DELETE /api/categories/:id", () => {
    it("should return 404 when category not found", async () => {
      mockAuthenticatedSession();
      mockGetCategoryById.mockResolvedValueOnce(null);

      const { default: handler } = await import("@api/categories/[id]");

      const req = createMockRequest({
        method: "DELETE",
        query: { id: "nonexistent" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(404);
    });

    it("should return 403 when trying to delete default category", async () => {
      mockAuthenticatedSession();

      const defaultCategory = {
        id: "cat-123",
        name: "Default",
        color: "#000000",
        icon: "star",
        userId: "user-123",
        isDefault: true,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGetCategoryById.mockResolvedValueOnce(defaultCategory);

      const { default: handler } = await import("@api/categories/[id]");

      const req = createMockRequest({
        method: "DELETE",
        query: { id: "cat-123" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(403);
      expect(res._json).toEqual(
        expect.objectContaining({
          error: expect.objectContaining({
            code: "FORBIDDEN",
          }),
        }),
      );
    });

    it("should delete category successfully", async () => {
      mockAuthenticatedSession();

      const category = {
        id: "cat-123",
        name: "Work",
        color: "#FF0000",
        icon: "briefcase",
        userId: "user-123",
        isDefault: false,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGetCategoryById.mockResolvedValueOnce(category);
      mockDeleteCategory.mockResolvedValueOnce(true);

      const { default: handler } = await import("@api/categories/[id]");

      const req = createMockRequest({
        method: "DELETE",
        query: { id: "cat-123" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(200);
      expect(mockDeleteCategory).toHaveBeenCalledWith("cat-123", "user-123");
    });
  });

  describe("Method Not Allowed", () => {
    it("should return 405 for unsupported methods on index", async () => {
      mockAuthenticatedSession();

      const { default: handler } = await import("@api/categories/index");

      const req = createMockRequest({ method: "PUT" });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(405);
    });

    it("should return 405 for unsupported methods on [id]", async () => {
      mockAuthenticatedSession();

      const { default: handler } = await import("@api/categories/[id]");

      const req = createMockRequest({
        method: "PUT",
        query: { id: "cat-123" },
      });
      const res = createMockResponse();

      await handler(req as VercelRequest, res);

      expect(res._status).toBe(405);
    });
  });
});
