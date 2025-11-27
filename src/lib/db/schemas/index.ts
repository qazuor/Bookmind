// Tables

export {
  type Account,
  accounts,
  type NewAccount,
  type NewSession,
  type NewVerificationToken,
  type Session,
  sessions,
  type VerificationToken,
  verificationTokens,
} from "./auth";
export {
  type Bookmark,
  type BookmarkCollection,
  type BookmarkTag,
  bookmarkCollections,
  bookmarks,
  bookmarkTags,
  type NewBookmark,
  type NewBookmarkCollection,
  type NewBookmarkTag,
} from "./bookmarks";
export { type Category, categories, type NewCategory } from "./categories";
export {
  type Collection,
  collections,
  type NewCollection,
} from "./collections";
// Relations
export {
  accountsRelations,
  bookmarkCollectionsRelations,
  bookmarksRelations,
  bookmarkTagsRelations,
  categoriesRelations,
  collectionsRelations,
  sessionsRelations,
  tagsRelations,
  usersRelations,
  verificationTokensRelations,
} from "./relations";
export { type NewTag, type Tag, tags } from "./tags";
export { type NewUser, type User, users } from "./users";
