/**
 * Request Logging Middleware (P3-006)
 *
 * Logs request and response details for debugging and monitoring.
 */

import type { VercelResponse } from "@vercel/node";
import type { ApiRequest } from "../types";

/**
 * Log levels
 */
type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Log entry structure
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  type: "request" | "response";
  method: string;
  path: string;
  statusCode?: number;
  duration?: number;
  userId?: string;
  ip?: string;
  userAgent?: string;
  requestId?: string;
  error?: string;
  [key: string]: unknown;
}

/**
 * Logging configuration
 */
interface LoggingConfig {
  /** Enable logging */
  enabled?: boolean;
  /** Log level */
  level?: LogLevel;
  /** Log request body */
  logBody?: boolean;
  /** Log response body */
  logResponseBody?: boolean;
  /** Fields to redact from logs */
  redactFields?: string[];
  /** Custom logger function */
  logger?: (entry: LogEntry) => void;
  /** Include timing information */
  includeTiming?: boolean;
  /** Generate request ID */
  generateRequestId?: boolean;
}

const DEFAULT_CONFIG: LoggingConfig = {
  enabled: true,
  level: "info",
  logBody: false,
  logResponseBody: false,
  redactFields: ["password", "token", "secret", "apiKey", "authorization"],
  includeTiming: true,
  generateRequestId: true,
};

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get IP address from request
 */
function getIpAddress(req: ApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  if (Array.isArray(forwarded)) {
    return forwarded[0] || "unknown";
  }
  return (
    (req.headers["x-real-ip"] as string) ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

/**
 * Redact sensitive fields from an object
 */
function redactSensitiveFields(obj: unknown, fields: string[]): unknown {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitiveFields(item, fields));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (fields.some((f) => key.toLowerCase().includes(f.toLowerCase()))) {
      result[key] = "[REDACTED]";
    } else if (typeof value === "object") {
      result[key] = redactSensitiveFields(value, fields);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Default logger function
 */
function defaultLogger(entry: LogEntry): void {
  const { level, ...rest } = entry;
  const logFn = console[level] || console.log;
  logFn(JSON.stringify(rest));
}

/**
 * Request logging middleware
 *
 * @example
 * ```ts
 * export default withLogging(async (req, res) => {
 *   // Handler code - requests will be logged
 * });
 * ```
 */
export function withLogging<TBody = unknown, TQuery = unknown>(
  configOrHandler:
    | LoggingConfig
    | ((
        req: ApiRequest<TBody, TQuery>,
        res: VercelResponse,
      ) => Promise<void | VercelResponse>),
  maybeHandler?: (
    req: ApiRequest<TBody, TQuery>,
    res: VercelResponse,
  ) => Promise<void | VercelResponse>,
) {
  const config: LoggingConfig =
    typeof configOrHandler === "function"
      ? DEFAULT_CONFIG
      : { ...DEFAULT_CONFIG, ...configOrHandler };
  const handler =
    typeof configOrHandler === "function" ? configOrHandler : maybeHandler!;
  const logger = config.logger || defaultLogger;

  return async (
    req: ApiRequest<TBody, TQuery>,
    res: VercelResponse,
  ): Promise<void | VercelResponse> => {
    if (!config.enabled) {
      return handler(req, res);
    }

    const startTime = Date.now();
    const requestId = config.generateRequestId
      ? generateRequestId()
      : undefined;
    const baseReq = req as ApiRequest;

    // Add request ID to response headers
    if (requestId) {
      res.setHeader("X-Request-Id", requestId);
    }

    // Log request
    const requestEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: config.level || "info",
      type: "request",
      method: req.method || "UNKNOWN",
      path: req.url || "/",
      userId: baseReq.userId,
      ip: getIpAddress(baseReq),
      userAgent: req.headers["user-agent"],
      requestId,
    };

    if (config.logBody && req.body) {
      requestEntry.body = redactSensitiveFields(
        req.body,
        config.redactFields || [],
      );
    }

    logger(requestEntry);

    // Capture response
    const originalEnd = res.end.bind(res);
    let responseBody: unknown;

    res.end = ((chunk?: unknown, ...args: unknown[]) => {
      if (config.logResponseBody && chunk) {
        try {
          responseBody = typeof chunk === "string" ? JSON.parse(chunk) : chunk;
        } catch {
          responseBody = chunk;
        }
      }
      return originalEnd(chunk, ...(args as []));
    }) as typeof res.end;

    try {
      const result = await handler(req, res);

      // Log response
      const duration = Date.now() - startTime;
      const responseEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: res.statusCode >= 400 ? "warn" : config.level || "info",
        type: "response",
        method: req.method || "UNKNOWN",
        path: req.url || "/",
        statusCode: res.statusCode,
        duration: config.includeTiming ? duration : undefined,
        userId: baseReq.userId,
        requestId,
      };

      if (config.logResponseBody && responseBody) {
        responseEntry.responseBody = redactSensitiveFields(
          responseBody,
          config.redactFields || [],
        );
      }

      logger(responseEntry);

      return result;
    } catch (error) {
      // Log error
      const duration = Date.now() - startTime;
      const errorEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: "error",
        type: "response",
        method: req.method || "UNKNOWN",
        path: req.url || "/",
        statusCode: 500,
        duration: config.includeTiming ? duration : undefined,
        userId: baseReq.userId,
        requestId,
        error: error instanceof Error ? error.message : String(error),
      };

      logger(errorEntry);

      throw error;
    }
  };
}

/**
 * Create a simple request logger
 */
export function createRequestLogger(config?: LoggingConfig) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const logger = mergedConfig.logger || defaultLogger;

  return {
    logRequest: (req: ApiRequest, extra?: Record<string, unknown>) => {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: mergedConfig.level || "info",
        type: "request",
        method: req.method || "UNKNOWN",
        path: req.url || "/",
        userId: req.userId,
        ip: getIpAddress(req),
        ...extra,
      };
      logger(entry);
    },
    logResponse: (
      req: ApiRequest,
      statusCode: number,
      duration?: number,
      extra?: Record<string, unknown>,
    ) => {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: statusCode >= 400 ? "warn" : mergedConfig.level || "info",
        type: "response",
        method: req.method || "UNKNOWN",
        path: req.url || "/",
        statusCode,
        duration,
        userId: req.userId,
        ...extra,
      };
      logger(entry);
    },
    logError: (
      req: ApiRequest,
      error: Error,
      extra?: Record<string, unknown>,
    ) => {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: "error",
        type: "response",
        method: req.method || "UNKNOWN",
        path: req.url || "/",
        error: error.message,
        userId: req.userId,
        ...extra,
      };
      logger(entry);
    },
  };
}
