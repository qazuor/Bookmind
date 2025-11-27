/**
 * Better Auth Client Configuration
 *
 * Client-side authentication methods for:
 * - Email/Password sign in/up
 * - Social sign in (Google, GitHub)
 * - Session management
 */

import { createAuthClient } from "better-auth/react";

// Create the auth client with the base URL
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_APP_URL || "http://localhost:5173",
});

// Export individual methods for convenience
export const { signIn, signUp, signOut, useSession, getSession } = authClient;

// Type exports
export type AuthClient = typeof authClient;
