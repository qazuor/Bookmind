/**
 * Validation Middleware (P3-001)
 *
 * Validates request body and query parameters using Zod schemas.
 */

import type { VercelResponse } from "@vercel/node";
import type { ZodError, z } from "zod";
import { sendError, ValidationError } from "../errors";
import type { ApiRequest, ValidationConfig } from "../types";

/**
 * Parse and validate request body
 */
function parseBody(req: ApiRequest): unknown {
  if (!req.body) {
    return undefined;
  }

  // Body is already parsed by Vercel
  if (typeof req.body === "object") {
    return req.body;
  }

  // Try to parse JSON string
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return req.body;
    }
  }

  return req.body;
}

/**
 * Parse query parameters
 */
function parseQuery(
  req: ApiRequest,
): Record<string, string | string[] | undefined> {
  const query: Record<string, string | string[] | undefined> = {};

  for (const [key, value] of Object.entries(req.query || {})) {
    query[key] = value;
  }

  return query;
}

/**
 * Create validation middleware
 *
 * @example
 * ```ts
 * import { createBookmarkSchema } from "@/schemas";
 *
 * export default withValidation({
 *   body: createBookmarkSchema,
 * }, async (req, res) => {
 *   // req.parsedBody is typed and validated
 *   const bookmark = req.parsedBody;
 * });
 * ```
 */
export function withValidation<
  TBody extends z.ZodType = z.ZodType<unknown>,
  TQuery extends z.ZodType = z.ZodType<unknown>,
>(
  config: ValidationConfig<TBody, TQuery>,
  handler: (
    req: ApiRequest<z.infer<TBody>, z.infer<TQuery>>,
    res: VercelResponse,
  ) => Promise<void | VercelResponse>,
) {
  return async (
    req: ApiRequest,
    res: VercelResponse,
  ): Promise<void | VercelResponse> => {
    try {
      // Validate body if schema provided
      if (config.body) {
        const body = parseBody(req);
        const result = config.body.safeParse(body);

        if (!result.success) {
          const error = ValidationError.fromZodError(result.error as ZodError);
          return sendError(res, error);
        }

        req.parsedBody = result.data;
      }

      // Validate query if schema provided
      if (config.query) {
        const query = parseQuery(req);
        const result = config.query.safeParse(query);

        if (!result.success) {
          const error = ValidationError.fromZodError(result.error as ZodError);
          return sendError(res, error);
        }

        // biome-ignore lint/suspicious/noExplicitAny: Query type is validated at runtime
        (req as any).parsedQuery = result.data;
      }

      // Call the handler with validated data
      return handler(req as ApiRequest<z.infer<TBody>, z.infer<TQuery>>, res);
    } catch (error) {
      console.error("[Validation Middleware] Error:", error);
      throw error;
    }
  };
}

/**
 * Validate data with a Zod schema
 *
 * @example
 * ```ts
 * const result = validate(data, createBookmarkSchema);
 * if (result.success) {
 *   // result.data is typed
 * } else {
 *   // result.error contains validation errors
 * }
 * ```
 */
export function validate<T extends z.ZodType>(
  data: unknown,
  schema: T,
):
  | { success: true; data: z.infer<T> }
  | { success: false; error: ValidationError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: ValidationError.fromZodError(result.error as ZodError),
  };
}

/**
 * Validate or throw
 *
 * @example
 * ```ts
 * const data = validateOrThrow(input, createBookmarkSchema);
 * // data is typed, throws ValidationError if invalid
 * ```
 */
export function validateOrThrow<T extends z.ZodType>(
  data: unknown,
  schema: T,
): z.infer<T> {
  const result = validate(data, schema);

  if (!result.success) {
    throw result.error;
  }

  return result.data;
}
