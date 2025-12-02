/**
 * API Errors Unit Tests
 *
 * Tests for error classes and error handling utilities.
 */

import type { VercelResponse } from "@vercel/node";
import { describe, expect, it, vi } from "vitest";
import { type ZodError, z } from "zod";
import {
  ApiError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  handleError,
  InternalError,
  MethodNotAllowedError,
  NotFoundError,
  RateLimitError,
  ServiceUnavailableError,
  sendError,
  sendSuccess,
  UnauthorizedError,
  ValidationError,
} from "@/lib/api/errors";

// Create mock response
function createMockResponse(): VercelResponse & {
  _status: number;
  _json: unknown;
  _headers: Record<string, string>;
} {
  const res = {
    _status: 200,
    _json: null as unknown,
    _headers: {} as Record<string, string>,
    status: vi.fn().mockImplementation(function (
      this: { _status: number },
      code: number,
    ) {
      this._status = code;
      return this;
    }),
    json: vi.fn().mockImplementation(function (
      this: { _json: unknown },
      data: unknown,
    ) {
      this._json = data;
      return this;
    }),
    setHeader: vi.fn().mockImplementation(function (
      this: { _headers: Record<string, string> },
      name: string,
      value: string,
    ) {
      this._headers[name] = value;
      return this;
    }),
  };
  return res as unknown as VercelResponse & {
    _status: number;
    _json: unknown;
    _headers: Record<string, string>;
  };
}

describe("ApiError", () => {
  it("should create an error with all properties", () => {
    const error = new ApiError("Test error", 500, "TEST_ERROR", {
      detail: "extra",
    });

    expect(error.message).toBe("Test error");
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe("TEST_ERROR");
    expect(error.details).toEqual({ detail: "extra" });
    expect(error.name).toBe("ApiError");
  });

  it("should convert to response object", () => {
    const error = new ApiError("Test error", 400, "TEST", { key: "value" });
    const response = error.toResponse();

    expect(response.code).toBe("TEST");
    expect(response.message).toBe("Test error");
    expect(response.details).toEqual({ key: "value" });
  });

  it("should include stack in development", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const error = new ApiError("Test", 500, "TEST");
    const response = error.toResponse();

    expect(response.stack).toBeDefined();

    process.env.NODE_ENV = originalEnv;
  });

  it("should not include stack in production", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const error = new ApiError("Test", 500, "TEST");
    const response = error.toResponse();

    expect(response.stack).toBeUndefined();

    process.env.NODE_ENV = originalEnv;
  });
});

describe("BadRequestError", () => {
  it("should create with default message", () => {
    const error = new BadRequestError();
    expect(error.message).toBe("Bad request");
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("BAD_REQUEST");
    expect(error.name).toBe("BadRequestError");
  });

  it("should create with custom message and details", () => {
    const error = new BadRequestError("Invalid data", { field: "email" });
    expect(error.message).toBe("Invalid data");
    expect(error.details).toEqual({ field: "email" });
  });
});

describe("UnauthorizedError", () => {
  it("should create with default message", () => {
    const error = new UnauthorizedError();
    expect(error.message).toBe("Unauthorized");
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe("UNAUTHORIZED");
    expect(error.name).toBe("UnauthorizedError");
  });

  it("should create with custom message", () => {
    const error = new UnauthorizedError("Session expired");
    expect(error.message).toBe("Session expired");
  });
});

describe("ForbiddenError", () => {
  it("should create with default message", () => {
    const error = new ForbiddenError();
    expect(error.message).toBe("Forbidden");
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe("FORBIDDEN");
    expect(error.name).toBe("ForbiddenError");
  });

  it("should create with custom message", () => {
    const error = new ForbiddenError("Access denied");
    expect(error.message).toBe("Access denied");
  });
});

describe("NotFoundError", () => {
  it("should create with default resource", () => {
    const error = new NotFoundError();
    expect(error.message).toBe("Resource not found");
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe("NOT_FOUND");
    expect(error.name).toBe("NotFoundError");
  });

  it("should create with custom resource name", () => {
    const error = new NotFoundError("Bookmark");
    expect(error.message).toBe("Bookmark not found");
  });
});

describe("MethodNotAllowedError", () => {
  it("should create with method and allowed methods", () => {
    const error = new MethodNotAllowedError("DELETE", ["GET", "POST"]);
    expect(error.message).toBe("Method DELETE not allowed");
    expect(error.statusCode).toBe(405);
    expect(error.code).toBe("METHOD_NOT_ALLOWED");
    expect(error.name).toBe("MethodNotAllowedError");
    expect(error.details).toEqual({ allowed: ["GET", "POST"] });
  });
});

describe("ConflictError", () => {
  it("should create with default message", () => {
    const error = new ConflictError();
    expect(error.message).toBe("Resource already exists");
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe("CONFLICT");
    expect(error.name).toBe("ConflictError");
  });

  it("should create with custom message", () => {
    const error = new ConflictError("Email already in use");
    expect(error.message).toBe("Email already in use");
  });
});

describe("ValidationError", () => {
  it("should create with default message", () => {
    const error = new ValidationError();
    expect(error.message).toBe("Validation failed");
    expect(error.statusCode).toBe(422);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.name).toBe("ValidationError");
  });

  it("should create with custom message and details", () => {
    const error = new ValidationError("Invalid fields", {
      fields: { email: "required" },
    });
    expect(error.message).toBe("Invalid fields");
    expect(error.details).toEqual({ fields: { email: "required" } });
  });

  it("should create from ZodError", () => {
    const schema = z.object({
      email: z.string().email(),
      name: z.string().min(2),
    });

    try {
      schema.parse({ email: "invalid", name: "a" });
    } catch (e) {
      const zodError = e as ZodError;
      const error = ValidationError.fromZodError(zodError);

      expect(error.statusCode).toBe(422);
      expect(error.details).toHaveProperty("fields");
      expect(
        (error.details?.fields as Record<string, string[]>).email,
      ).toBeDefined();
      expect(
        (error.details?.fields as Record<string, string[]>).name,
      ).toBeDefined();
    }
  });

  it("should handle multiple errors on same field", () => {
    const schema = z.object({
      email: z.string().email().min(10),
    });

    try {
      schema.parse({ email: "a" });
    } catch (e) {
      const zodError = e as ZodError;
      const error = ValidationError.fromZodError(zodError);

      const fields = error.details?.fields as Record<string, string[]>;
      expect(fields.email?.length ?? 0).toBeGreaterThan(0);
    }
  });
});

describe("RateLimitError", () => {
  it("should create with retry after seconds", () => {
    const error = new RateLimitError(60);
    expect(error.message).toBe("Too many requests");
    expect(error.statusCode).toBe(429);
    expect(error.code).toBe("RATE_LIMITED");
    expect(error.name).toBe("RateLimitError");
    expect(error.retryAfter).toBe(60);
    expect(error.details).toEqual({ retryAfter: 60 });
  });
});

describe("InternalError", () => {
  it("should create with default message", () => {
    const error = new InternalError();
    expect(error.message).toBe("Internal server error");
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe("INTERNAL_ERROR");
    expect(error.name).toBe("InternalError");
  });

  it("should create with custom message", () => {
    const error = new InternalError("Database connection failed");
    expect(error.message).toBe("Database connection failed");
  });
});

describe("ServiceUnavailableError", () => {
  it("should create with default message", () => {
    const error = new ServiceUnavailableError();
    expect(error.message).toBe("Service temporarily unavailable");
    expect(error.statusCode).toBe(503);
    expect(error.code).toBe("SERVICE_UNAVAILABLE");
    expect(error.name).toBe("ServiceUnavailableError");
  });

  it("should create with custom message", () => {
    const error = new ServiceUnavailableError("Maintenance in progress");
    expect(error.message).toBe("Maintenance in progress");
  });
});

describe("sendError", () => {
  it("should send error response with correct status", () => {
    const res = createMockResponse();
    const error = new BadRequestError("Invalid input");

    sendError(res, error);

    expect(res._status).toBe(400);
    expect(res._json).toEqual({
      success: false,
      error: expect.objectContaining({
        code: "BAD_REQUEST",
        message: "Invalid input",
      }),
    });
  });

  it("should set Retry-After header for rate limit errors", () => {
    const res = createMockResponse();
    const error = new RateLimitError(120);

    sendError(res, error);

    expect(res._status).toBe(429);
    expect(res._headers["Retry-After"]).toBe("120");
  });
});

describe("sendSuccess", () => {
  it("should send success response with default status", () => {
    const res = createMockResponse();
    const data = { id: "123", name: "Test" };

    sendSuccess(res, data);

    expect(res._status).toBe(200);
    expect(res._json).toEqual({
      success: true,
      data,
      meta: undefined,
    });
  });

  it("should send success response with custom status", () => {
    const res = createMockResponse();
    const data = { id: "new" };

    sendSuccess(res, data, 201);

    expect(res._status).toBe(201);
  });

  it("should include meta in response", () => {
    const res = createMockResponse();
    const data = [{ id: "1" }, { id: "2" }];
    const meta = { page: 1, total: 10, limit: 20, totalPages: 1 };

    sendSuccess(res, data, 200, meta);

    expect(res._json).toEqual({
      success: true,
      data,
      meta,
    });
  });
});

describe("handleError", () => {
  it("should return ApiError as is", () => {
    const original = new BadRequestError("Original");
    const result = handleError(original);

    expect(result).toBe(original);
  });

  it("should convert Error to InternalError in production", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const error = new Error("Secret database error");
    const result = handleError(error);

    expect(result).toBeInstanceOf(InternalError);
    expect(result.message).toBe("Internal server error");

    process.env.NODE_ENV = originalEnv;
  });

  it("should include error message in development", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const error = new Error("Detailed error message");
    const result = handleError(error);

    expect(result).toBeInstanceOf(InternalError);
    expect(result.message).toBe("Detailed error message");

    process.env.NODE_ENV = originalEnv;
  });

  it("should handle unknown error types", () => {
    const result = handleError("string error");

    expect(result).toBeInstanceOf(InternalError);
    expect(result.message).toBe("Internal server error");
  });

  it("should handle null/undefined", () => {
    const resultNull = handleError(null);
    const resultUndefined = handleError(undefined);

    expect(resultNull).toBeInstanceOf(InternalError);
    expect(resultUndefined).toBeInstanceOf(InternalError);
  });
});
