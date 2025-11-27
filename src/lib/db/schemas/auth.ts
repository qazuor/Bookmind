import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

// OAuth accounts (Google, GitHub, etc.) - Better Auth compatible
export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(), // Better Auth generates string IDs
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerId: text("provider_id").notNull(), // "google", "github", "credential"
    accountId: text("account_id").notNull(), // Provider's account ID
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
    password: text("password"), // For credential provider
    // Timestamps
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

// User sessions - Better Auth compatible
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(), // Better Auth generates string IDs
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    // Timestamps
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

// Email verification tokens (Better Auth compatible)
// Note: Better Auth uses string IDs, not UUIDs
export const verificationTokens = pgTable(
  "verification_tokens",
  {
    id: text("id").primaryKey(), // Better Auth generates string IDs
    identifier: text("identifier").notNull(), // email or other identifier
    value: text("value").notNull().unique(), // the token value
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

// Types
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;
