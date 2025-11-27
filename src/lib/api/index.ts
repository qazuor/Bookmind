/**
 * API Module Exports
 *
 * Main entry point for all API utilities.
 */

// Errors
export {
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
} from "./errors";
// Handler builder
export {
  createGetHandler,
  createHandler,
  createPostHandler,
} from "./handler";
// Middleware
export {
  // Error handling
  asyncHandler,
  // Rate limiting
  checkRateLimit,
  createGlobalErrorHandler,
  // Logging
  createRequestLogger,
  // CSRF
  csrfTokenHandler,
  generateCsrfToken,
  // Bot protection
  generateFormTimestamp,
  getCsrfToken,
  isBot,
  RATE_LIMITS,
  type RateLimitType,
  safeJsonParse,
  tryCatch,
  // Validation
  validate,
  validateOrThrow,
  withBotProtection,
  withCsrf,
  withErrorHandler,
  withLogging,
  withRateLimit,
  withValidation,
} from "./middleware";
// Types
export type {
  ApiErrorResponse,
  ApiHandler,
  ApiMeta,
  ApiRequest,
  ApiResponse,
  HttpMethod,
  Middleware,
  RateLimitConfig,
  RouteConfig,
  ValidationConfig,
} from "./types";
