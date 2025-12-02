/**
 * CSRF Token Endpoint
 *
 * Provides CSRF tokens for frontend forms.
 * GET /api/csrf-token
 */

import { csrfTokenHandler, withRateLimit } from "@/lib/api/middleware";

export default withRateLimit("api", csrfTokenHandler());
