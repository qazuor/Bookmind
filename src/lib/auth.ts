/**
 * Better Auth Server Configuration
 *
 * Handles authentication with:
 * - Email/Password
 * - Google OAuth
 * - GitHub OAuth
 *
 * Uses Drizzle adapter for PostgreSQL database.
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";

export const auth = betterAuth({
  // Base configuration
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5173",

  // Database adapter with Drizzle
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      // Map our table names to Better Auth's expected names
      user: schema.users,
      account: schema.accounts,
      session: schema.sessions,
      verification: schema.verificationTokens,
    },
  }),

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    // Password reset configuration
    sendResetPassword: async ({ user, url }) => {
      // For MVP: Log the reset URL (in production, send via email service)
      console.log(`[Auth] Password reset requested for ${user.email}`);
      console.log(`[Auth] Reset URL: ${url}`);
      // TODO: Implement email sending with Resend or similar service
      // await sendEmail({
      //   to: user.email,
      //   subject: "Reset your BookMind password",
      //   html: `Click here to reset your password: <a href="${url}">${url}</a>`
      // });
    },
  },

  // Social providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      // Always get refresh token
      accessType: "offline",
      prompt: "select_account consent",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      // Required scope for email access
      scope: ["user:email"],
    },
  },

  // Account linking configuration
  account: {
    accountLinking: {
      enabled: true,
      // Trust verified emails from these providers
      trustedProviders: ["google", "github"],
    },
  },

  // Session configuration
  session: {
    // Session expires in 7 days
    expiresIn: 60 * 60 * 24 * 7,
    // Refresh session if less than 1 day remaining
    updateAge: 60 * 60 * 24,
    // Use cookies for session storage
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes cache
    },
  },

  // User configuration
  user: {
    // Fields to store from social providers
    additionalFields: {
      username: {
        type: "string",
        required: false,
      },
      bio: {
        type: "string",
        required: false,
      },
      language: {
        type: "string",
        required: false,
        defaultValue: "en",
      },
      theme: {
        type: "string",
        required: false,
        defaultValue: "system",
      },
    },
  },

  // Enable experimental joins for better performance
  experimental: {
    joins: true,
  },
});

// Export auth types
export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
