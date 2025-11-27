/**
 * Better Auth Client Configuration
 *
 * Client-side authentication methods for:
 * - Email/Password sign in/up
 * - Social sign in (Google, GitHub)
 * - Password reset
 * - Session management
 */

import { createAuthClient } from "better-auth/react";

// Create the auth client with the base URL
// In browser, use current origin for proper port handling with vercel dev
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return import.meta.env.VITE_APP_URL || "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

// Export individual methods for convenience
export const { signIn, signUp, signOut, useSession, getSession } = authClient;

// Type exports
export type AuthClient = typeof authClient;
