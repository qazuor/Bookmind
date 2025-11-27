import {
  boolean,
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { categories } from "./categories";
import { collections } from "./collections";
import { tags } from "./tags";
import { users } from "./users";

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Core fields
    url: text("url").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    notes: text("notes"),
    // Metadata (extracted from URL)
    favicon: text("favicon"),
    ogImage: text("og_image"),
    ogTitle: text("og_title"),
    ogDescription: text("og_description"),
    // Category (one per bookmark)
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    // Visibility and status
    isPublic: boolean("is_public").notNull().default(false),
    isPinned: boolean("is_pinned").notNull().default(false),
    isArchived: boolean("is_archived").notNull().default(false),
    // AI-generated content
    aiSummary: text("ai_summary"),
    aiTags: jsonb("ai_tags").$type<string[]>(),
    aiCategory: text("ai_category"),
    aiProcessedAt: timestamp("ai_processed_at", { withTimezone: true }),
    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("bookmarks_user_id_idx").on(table.userId),
    index("bookmarks_category_id_idx").on(table.categoryId),
    index("bookmarks_user_created_idx").on(table.userId, table.createdAt),
    index("bookmarks_user_public_idx").on(table.userId, table.isPublic),
    index("bookmarks_user_archived_idx").on(table.userId, table.isArchived),
    index("bookmarks_user_pinned_idx").on(table.userId, table.isPinned),
    index("bookmarks_url_idx").on(table.url),
  ],
);

// Junction table: bookmarks <-> tags (many-to-many)
export const bookmarkTags = pgTable(
  "bookmark_tags",
  {
    bookmarkId: uuid("bookmark_id")
      .notNull()
      .references(() => bookmarks.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.bookmarkId, table.tagId] }),
    index("bookmark_tags_bookmark_id_idx").on(table.bookmarkId),
    index("bookmark_tags_tag_id_idx").on(table.tagId),
  ],
);

// Junction table: bookmarks <-> collections (many-to-many)
export const bookmarkCollections = pgTable(
  "bookmark_collections",
  {
    bookmarkId: uuid("bookmark_id")
      .notNull()
      .references(() => bookmarks.id, { onDelete: "cascade" }),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.bookmarkId, table.collectionId] }),
    index("bookmark_collections_bookmark_id_idx").on(table.bookmarkId),
    index("bookmark_collections_collection_id_idx").on(table.collectionId),
  ],
);

// Types
export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;
export type BookmarkTag = typeof bookmarkTags.$inferSelect;
export type NewBookmarkTag = typeof bookmarkTags.$inferInsert;
export type BookmarkCollection = typeof bookmarkCollections.$inferSelect;
export type NewBookmarkCollection = typeof bookmarkCollections.$inferInsert;
