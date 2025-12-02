/**
 * API Middleware Integration Tests (P10-005)
 *
 * Tests for API middleware including auth, rate limiting, and error handling.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { withAuth, withOptionalAuth } from "@/lib/api/auth";
import {
  BadRequestError,
  NotFoundError,
  sendError,
  sendSuccess,
  UnauthorizedError,
} from "@/lib/api/errors";
import type { ApiRequest } from "@/lib/api/types";

// Mock Better Auth
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

import { auth } from "@/lib/auth";

const mockGetSession = vi.mocked(auth.api.getSession);

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
function createMockResponse(): VercelResponse {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
  };
  return res as unknown as VercelResponse;
}

describe("Auth Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("withAuth", () => {
    it("should call handler with userId when authenticated", async () => {
      mockGetSession.mockResolvedValueOnce({
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

      const handler = vi.fn();
      const wrappedHandler = withAuth(handler);

      const req = createMockRequest();
      const res = createMockResponse();

      await wrappedHandler(req, res);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0]?.[0]).toHaveProperty("userId", "user-123");
    });

    it("should return 401 when not authenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);

      const handler = vi.fn();
      const wrappedHandler = withAuth(handler);

      const req = createMockRequest();
      const res = createMockResponse();

      await wrappedHandler(req, res);

      expect(handler).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: "UNAUTHORIZED",
          }),
        }),
      );
    });

    it("should return 401 when session has no user", async () => {
      mockGetSession.mockResolvedValueOnce({
        user: null as unknown as ReturnType<
          typeof mockGetSession
        > extends Promise<infer T>
          ? T extends { user: infer U }
            ? U
            : never
          : never,
        session: null as unknown as ReturnType<
          typeof mockGetSession
        > extends Promise<infer T>
          ? T extends { session: infer S }
            ? S
            : never
          : never,
      });

      const handler = vi.fn();
      const wrappedHandler = withAuth(handler);

      const req = createMockRequest();
      const res = createMockResponse();

      await wrappedHandler(req, res);

      expect(handler).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe("withOptionalAuth", () => {
    it("should call handler with userId when authenticated", async () => {
      mockGetSession.mockResolvedValueOnce({
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

      const handler = vi.fn();
      const wrappedHandler = withOptionalAuth(handler);

      const req = createMockRequest();
      const res = createMockResponse();

      await wrappedHandler(req, res);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0]?.[0]).toHaveProperty("userId", "user-123");
    });

    it("should call handler with null userId when not authenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);

      const handler = vi.fn();
      const wrappedHandler = withOptionalAuth(handler);

      const req = createMockRequest();
      const res = createMockResponse();

      await wrappedHandler(req, res);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0]?.[0]).toHaveProperty("userId", null);
    });
  });
});

describe("Error Handling", () => {
  describe("sendError", () => {
    it("should send BadRequestError with 400 status", () => {
      const res = createMockResponse();
      const error = new BadRequestError("Invalid input");

      sendError(res, error);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: "BAD_REQUEST",
            message: "Invalid input",
          }),
        }),
      );
    });

    it("should send UnauthorizedError with 401 status", () => {
      const res = createMockResponse();
      const error = new UnauthorizedError("Not logged in");

      sendError(res, error);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: "UNAUTHORIZED",
            message: "Not logged in",
          }),
        }),
      );
    });

    it("should send NotFoundError with 404 status", () => {
      const res = createMockResponse();
      const error = new NotFoundError("Resource");

      sendError(res, error);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: "NOT_FOUND",
            message: "Resource not found",
          }),
        }),
      );
    });

    it("should include details in error response", () => {
      const res = createMockResponse();
      const error = new BadRequestError("Validation failed", {
        field: "email",
        issue: "invalid format",
      });

      sendError(res, error);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            details: {
              field: "email",
              issue: "invalid format",
            },
          }),
        }),
      );
    });
  });

  describe("sendSuccess", () => {
    it("should send data with 200 status by default", () => {
      const res = createMockResponse();
      const data = { id: "123", name: "Test" };

      sendSuccess(res, data);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
        meta: undefined,
      });
    });

    it("should send data with custom status", () => {
      const res = createMockResponse();
      const data = { id: "123" };

      sendSuccess(res, data, 201);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should send array data", () => {
      const res = createMockResponse();
      const data = [{ id: "1" }, { id: "2" }];

      sendSuccess(res, data);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
        meta: undefined,
      });
    });

    it("should include meta when provided", () => {
      const res = createMockResponse();
      const data = { id: "123" };
      const meta = { page: 1, total: 10, limit: 20, totalPages: 1 };

      sendSuccess(res, data, 200, meta);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
        meta,
      });
    });
  });
});
