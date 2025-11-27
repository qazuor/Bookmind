/**
 * API Middleware Exports
 *
 * All middleware functions for API endpoints.
 */

// Bot Protection (P3-003)
export {
  generateFormTimestamp,
  isBot,
  withBotProtection,
} from "./bot-protection";
// CSRF Protection (P3-004)
export {
  csrfTokenHandler,
  generateCsrfToken,
  getCsrfToken,
  withCsrf,
} from "./csrf";
// Error Handling (P3-005)
export {
  asyncHandler,
  createGlobalErrorHandler,
  safeJsonParse,
  tryCatch,
  withErrorHandler,
} from "./error-handler";
// Request Logging (P3-006)
export { createRequestLogger, withLogging } from "./logging";
// Rate Limiting (P3-002)
export {
  checkRateLimit,
  RATE_LIMITS,
  type RateLimitType,
  withRateLimit,
} from "./rate-limit";
// Validation (P3-001)
export { validate, validateOrThrow, withValidation } from "./validation";
