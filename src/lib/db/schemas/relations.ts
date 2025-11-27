import { relations } from "drizzle-orm";
import { accounts, sessions } from "./auth";
import { bookmarkCollections, bookmarks, bookmarkTags } from "./bookmarks";
import { categories } from "./categories";
import { collections } from "./collections";
import { tags } from "./tags";
import { users } from "./users";

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  categories: many(categories),
  collections: many(collections),
  tags: many(tags),
  bookmarks: many(bookmarks),
}));

// Account relations
export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

// Session relations
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Category relations
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  bookmarks: many(bookmarks),
}));

// Collection relations
export const collectionsRelations = relations(collections, ({ one, many }) => ({
  user: one(users, {
    fields: [collections.userId],
    references: [users.id],
  }),
  parent: one(collections, {
    fields: [collections.parentId],
    references: [collections.id],
    relationName: "parentChild",
  }),
  children: many(collections, {
    relationName: "parentChild",
  }),
  bookmarkCollections: many(bookmarkCollections),
}));

// Tag relations
export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, {
    fields: [tags.userId],
    references: [users.id],
  }),
  bookmarkTags: many(bookmarkTags),
}));

// Bookmark relations
export const bookmarksRelations = relations(bookmarks, ({ one, many }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [bookmarks.categoryId],
    references: [categories.id],
  }),
  bookmarkTags: many(bookmarkTags),
  bookmarkCollections: many(bookmarkCollections),
}));

// BookmarkTag junction relations
export const bookmarkTagsRelations = relations(bookmarkTags, ({ one }) => ({
  bookmark: one(bookmarks, {
    fields: [bookmarkTags.bookmarkId],
    references: [bookmarks.id],
  }),
  tag: one(tags, {
    fields: [bookmarkTags.tagId],
    references: [tags.id],
  }),
}));

// BookmarkCollection junction relations
export const bookmarkCollectionsRelations = relations(
  bookmarkCollections,
  ({ one }) => ({
    bookmark: one(bookmarks, {
      fields: [bookmarkCollections.bookmarkId],
      references: [bookmarks.id],
    }),
    collection: one(collections, {
      fields: [bookmarkCollections.collectionId],
      references: [collections.id],
    }),
  }),
);
