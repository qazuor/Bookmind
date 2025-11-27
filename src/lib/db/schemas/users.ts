import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Users table - Better Auth compatible
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(), // Better Auth generates string IDs
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    name: text("name"),
    image: text("image"), // Better Auth uses 'image' not 'avatarUrl'
    // Custom fields (not from Better Auth)
    username: text("username").unique(),
    bio: text("bio"),
    // Preferences
    language: text("language").notNull().default("en"),
    theme: text("theme").notNull().default("system"),
    defaultVisibility: text("default_visibility").notNull().default("private"),
    emailNotifications: boolean("email_notifications").notNull().default(true),
    // Timestamps
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

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
