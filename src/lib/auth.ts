import { betterAuth } from "better-auth";

// Server-side auth configuration
// Will be expanded in Phase 2 with social providers
export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.VITE_APP_URL,
  // Database adapter will be configured with Drizzle
  // Social providers will be added in Phase 2
});

// Export types
export type Auth = typeof auth;
