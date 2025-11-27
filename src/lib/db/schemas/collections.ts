import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const collections = pgTable(
  "collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    // Self-referencing for nested collections
    parentId: uuid("parent_id"),
    // Sharing
    isPublic: boolean("is_public").notNull().default(false),
    shareToken: text("share_token").unique(),
    shareExpiresAt: timestamp("share_expires_at", { withTimezone: true }),
    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("collections_user_id_idx").on(table.userId),
    index("collections_parent_id_idx").on(table.parentId),
    index("collections_share_token_idx").on(table.shareToken),
  ],
);

// Types
export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;
