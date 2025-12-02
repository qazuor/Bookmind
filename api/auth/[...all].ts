/**
 * =============================================================================
 * BETTER AUTH API HANDLER
 * =============================================================================
 *
 * ⚠️  TEMPORARY WORKAROUND - DO NOT EXPAND
 *
 * This file has inlined schema definitions due to Vercel's ES module
 * resolution issues in serverless functions. Path aliases and directory
 * imports don't work properly.
 *
 * WHEN TO REVERT:
 * - When upgrading to Vercel Pro plan
 * - When using a custom server
 * - When Vercel fixes ES module resolution
 *
 * HOW TO REVERT:
 * Replace this file with the simple version that imports from src/lib/auth
 *
 * =============================================================================
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { toNodeHandler } from "better-auth/node";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// =============================================================================
// INLINED SCHEMA DEFINITIONS
// =============================================================================

const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    name: text("name"),
    image: text("image"),
    username: text("username").unique(),
    bio: text("bio"),
    language: text("language").notNull().default("en"),
    theme: text("theme").notNull().default("system"),
    defaultVisibility: text("default_visibility").notNull().default("private"),
    emailNotifications: boolean("email_notifications").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("users_email_idx").on(table.email),
    index("users_username_idx").on(table.username),
  ],
);

const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerId: text("provider_id").notNull(),
    accountId: text("account_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    idToken: text("id_token"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("accounts_user_id_idx").on(table.userId),
    index("accounts_provider_idx").on(table.providerId, table.accountId),
  ],
);

const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_token_idx").on(table.token),
  ],
);

const verificationTokens = pgTable(
  "verification_tokens",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("verification_tokens_identifier_idx").on(table.identifier),
    index("verification_tokens_value_idx").on(table.value),
  ],
);

// =============================================================================
// DATABASE CONNECTION
// =============================================================================

const databaseUrl = process.env.DATABASE_URL ?? "";
const db = drizzle(neon(databaseUrl));

// =============================================================================
// BETTER AUTH CONFIGURATION
// =============================================================================

const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5173",

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      account: accounts,
      session: sessions,
      verification: verificationTokens,
    },
  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user, url }) => {
      console.log(`[Auth] Password reset requested for ${user.email}`);
      console.log(`[Auth] Reset URL: ${url}`);
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      accessType: "offline",
      prompt: "select_account consent",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      scope: ["user:email"],
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
    },
  },

  user: {
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

  experimental: {
    joins: true,
  },
});

// =============================================================================
// HANDLER
// =============================================================================

const handler = toNodeHandler(auth);

export default async function (req: VercelRequest, res: VercelResponse) {
  console.log(`[Auth] ${req.method} ${req.url}`);
  return handler(req, res);
}
