/**
 * API Errors
 *
 * Standardized error classes and error handling utilities.
 */

import type { VercelResponse } from "@vercel/node";
import type { ZodError } from "zod";
import type { ApiErrorResponse, ApiResponse } from "./types";

/**
 * Base API error class
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  toResponse(): ApiErrorResponse {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      stack: process.env.NODE_ENV === "development" ? this.stack : undefined,
    };
  }
}

/**
 * 400 Bad Request - Invalid input
 */
export class BadRequestError extends ApiError {
  constructor(message = "Bad request", details?: Record<string, unknown>) {
    super(message, 400, "BAD_REQUEST", details);
    this.name = "BadRequestError";
  }
}

/**
 * 401 Unauthorized - Not authenticated
 */
export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

/**
 * 403 Forbidden - Not allowed
 */
export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

/**
 * 404 Not Found - Resource not found
 */
export class NotFoundError extends ApiError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

/**
 * 405 Method Not Allowed
 */
export class MethodNotAllowedError extends ApiError {
  constructor(method: string, allowedMethods: string[]) {
    super(`Method ${method} not allowed`, 405, "METHOD_NOT_ALLOWED", {
      allowed: allowedMethods,
    });
    this.name = "MethodNotAllowedError";
  }
}

/**
 * 409 Conflict - Resource already exists
 */
export class ConflictError extends ApiError {
  constructor(message = "Resource already exists") {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

/**
 * 422 Unprocessable Entity - Validation failed
 */
export class ValidationError extends ApiError {
  constructor(
    message = "Validation failed",
    details?: Record<string, unknown>,
  ) {
    super(message, 422, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }

  /**
   * Create from Zod error
   */
  static fromZodError(error: ZodError): ValidationError {
    const fieldErrors: Record<string, string[]> = {};

    for (const issue of error.issues) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(issue.message);
    }

    return new ValidationError("Validation failed", { fields: fieldErrors });
  }
}

/**
 * 429 Too Many Requests - Rate limited
 */
export class RateLimitError extends ApiError {
  readonly retryAfter: number;

  constructor(retryAfter: number) {
    super("Too many requests", 429, "RATE_LIMITED", { retryAfter });
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalError extends ApiError {
  constructor(message = "Internal server error") {
    super(message, 500, "INTERNAL_ERROR");
    this.name = "InternalError";
  }
}

/**
 * 503 Service Unavailable
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message = "Service temporarily unavailable") {
    super(message, 503, "SERVICE_UNAVAILABLE");
    this.name = "ServiceUnavailableError";
  }
}

/**
 * Send error response
 */
export function sendError(res: VercelResponse, error: ApiError): void {
  const response: ApiResponse = {
    success: false,
    error: error.toResponse(),
  };

  if (error instanceof RateLimitError) {
    res.setHeader("Retry-After", error.retryAfter.toString());
  }

  res.status(error.statusCode).json(response);
}

/**
 * Send success response
 */
export function sendSuccess<T>(
  res: VercelResponse,
  data: T,
  statusCode = 200,
  meta?: ApiResponse["meta"],
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta,
  };

  res.status(statusCode).json(response);
}

/**
 * Handle unknown errors and convert to ApiError
 */
export function handleError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    console.error("[API Error]", error);
    return new InternalError(
      process.env.NODE_ENV === "development"
        ? error.message
        : "Internal server error",
    );
  }

  console.error("[API Error] Unknown error:", error);
  return new InternalError();
}
