/**
 * Bookmarks Service
 *
 * Business logic for bookmark CRUD operations with tags and collections.
 */

import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  sql,
} from "drizzle-orm";
import type {
  CreateBookmarkInput,
  ListBookmarksInput,
  UpdateBookmarkInput,
} from "@/schemas/bookmark.schema";
import { db } from "../db";
import {
  type Bookmark,
  bookmarkCollections,
  bookmarks,
  bookmarkTags,
  categories,
  collections,
  type NewBookmark,
  tags,
} from "../db/schema";

/**
 * Bookmark with relations
 */
export interface BookmarkWithRelations extends Bookmark {
  category?: {
    id: string;
    name: string;
    color: string;
    icon: string | null;
  } | null;
  tags?: {
    id: string;
    name: string;
    color: string | null;
  }[];
  collections?: {
    id: string;
    name: string;
  }[];
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Get bookmarks with optional filtering and pagination
 */
export async function getBookmarks(
  userId: string,
  input: ListBookmarksInput,
): Promise<PaginatedResult<BookmarkWithRelations>> {
  const {
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
    ...filters
  } = input;

  const offset = (page - 1) * limit;

  // Build conditions
  const conditions = [eq(bookmarks.userId, userId)];

  if (filters.categoryId) {
    conditions.push(eq(bookmarks.categoryId, filters.categoryId));
  }

  if (filters.isPublic !== undefined) {
    conditions.push(eq(bookmarks.isPublic, filters.isPublic));
  }

  if (filters.isArchived !== undefined) {
    conditions.push(eq(bookmarks.isArchived, filters.isArchived));
  }

  if (filters.isPinned !== undefined) {
    conditions.push(eq(bookmarks.isPinned, filters.isPinned));
  }

  if (filters.startDate) {
    conditions.push(gte(bookmarks.createdAt, filters.startDate));
  }

  if (filters.endDate) {
    conditions.push(lte(bookmarks.createdAt, filters.endDate));
  }

  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(bookmarks.title, searchTerm),
        ilike(bookmarks.description, searchTerm),
        ilike(bookmarks.url, searchTerm),
        ilike(bookmarks.notes, searchTerm),
      )!,
    );
  }

  // Handle tag filtering
  let bookmarkIdsWithTags: string[] | undefined;
  if (filters.tagIds && filters.tagIds.length > 0) {
    const bookmarksWithTags = await db
      .select({ bookmarkId: bookmarkTags.bookmarkId })
      .from(bookmarkTags)
      .where(inArray(bookmarkTags.tagId, filters.tagIds))
      .groupBy(bookmarkTags.bookmarkId)
      .having(
        sql`count(distinct ${bookmarkTags.tagId}) = ${filters.tagIds.length}`,
      );

    bookmarkIdsWithTags = bookmarksWithTags.map((b) => b.bookmarkId);
    if (bookmarkIdsWithTags.length === 0) {
      return {
        data: [],
        meta: { page, limit, total: 0, totalPages: 0, hasMore: false },
      };
    }
    conditions.push(inArray(bookmarks.id, bookmarkIdsWithTags));
  }

  // Handle collection filtering
  let bookmarkIdsInCollection: string[] | undefined;
  if (filters.collectionId) {
    const bookmarksInCollection = await db
      .select({ bookmarkId: bookmarkCollections.bookmarkId })
      .from(bookmarkCollections)
      .where(eq(bookmarkCollections.collectionId, filters.collectionId));

    bookmarkIdsInCollection = bookmarksInCollection.map((b) => b.bookmarkId);
    if (bookmarkIdsInCollection.length === 0) {
      return {
        data: [],
        meta: { page, limit, total: 0, totalPages: 0, hasMore: false },
      };
    }
    conditions.push(inArray(bookmarks.id, bookmarkIdsInCollection));
  }

  // Get total count
  const countResult = await db
    .select({ count: count() })
    .from(bookmarks)
    .where(and(...conditions));

  const total = Number(countResult[0]?.count ?? 0);
  const totalPages = Math.ceil(total / limit);

  // Build sort
  const sortColumn =
    sortBy === "title"
      ? bookmarks.title
      : sortBy === "url"
        ? bookmarks.url
        : sortBy === "updatedAt"
          ? bookmarks.updatedAt
          : bookmarks.createdAt;

  const orderBy = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  // Get bookmarks
  const bookmarkResults = await db
    .select()
    .from(bookmarks)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  // Fetch relations for results
  const bookmarksWithRelations = await Promise.all(
    bookmarkResults.map((bookmark) => fetchBookmarkRelations(bookmark)),
  );

  return {
    data: bookmarksWithRelations,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

/**
 * Fetch relations for a bookmark
 */
async function fetchBookmarkRelations(
  bookmark: Bookmark,
): Promise<BookmarkWithRelations> {
  const result: BookmarkWithRelations = { ...bookmark };

  // Fetch category
  if (bookmark.categoryId) {
    const categoryResult = await db
      .select({
        id: categories.id,
        name: categories.name,
        color: categories.color,
        icon: categories.icon,
      })
      .from(categories)
      .where(eq(categories.id, bookmark.categoryId))
      .limit(1);

    result.category = categoryResult[0] ?? null;
  } else {
    result.category = null;
  }

  // Fetch tags
  const tagResults = await db
    .select({
      id: tags.id,
      name: tags.name,
      color: tags.color,
    })
    .from(tags)
    .innerJoin(bookmarkTags, eq(bookmarkTags.tagId, tags.id))
    .where(eq(bookmarkTags.bookmarkId, bookmark.id));

  result.tags = tagResults;

  // Fetch collections
  const collectionResults = await db
    .select({
      id: collections.id,
      name: collections.name,
    })
    .from(collections)
    .innerJoin(
      bookmarkCollections,
      eq(bookmarkCollections.collectionId, collections.id),
    )
    .where(eq(bookmarkCollections.bookmarkId, bookmark.id));

  result.collections = collectionResults;

  return result;
}

/**
 * Get a single bookmark by ID with relations
 */
export async function getBookmarkById(
  bookmarkId: string,
  userId: string,
): Promise<BookmarkWithRelations | null> {
  const result = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, userId)))
    .limit(1);

  if (!result[0]) {
    return null;
  }

  return fetchBookmarkRelations(result[0]);
}

/**
 * Get bookmark by URL (for duplicate checking)
 */
export async function getBookmarkByUrl(
  url: string,
  userId: string,
): Promise<Bookmark | null> {
  const result = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.url, url), eq(bookmarks.userId, userId)))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Create a new bookmark
 */
export async function createBookmark(
  userId: string,
  input: CreateBookmarkInput,
): Promise<BookmarkWithRelations> {
  const { tagIds, collectionIds, ...bookmarkData } = input;

  const newBookmark: NewBookmark = {
    userId,
    url: bookmarkData.url,
    title: bookmarkData.title ?? "Untitled", // Will be replaced by metadata extraction
    description: bookmarkData.description ?? null,
    notes: bookmarkData.notes ?? null,
    categoryId: bookmarkData.categoryId ?? null,
    isPublic: bookmarkData.isPublic ?? false,
    isPinned: bookmarkData.isPinned ?? false,
  };

  const result = await db.insert(bookmarks).values(newBookmark).returning();
  const bookmark = result[0]!;

  // Add tags
  if (tagIds && tagIds.length > 0) {
    await db.insert(bookmarkTags).values(
      tagIds.map((tagId) => ({
        bookmarkId: bookmark.id,
        tagId,
      })),
    );
  }

  // Add to collections
  if (collectionIds && collectionIds.length > 0) {
    await db.insert(bookmarkCollections).values(
      collectionIds.map((collectionId) => ({
        bookmarkId: bookmark.id,
        collectionId,
      })),
    );
  }

  return fetchBookmarkRelations(bookmark);
}

/**
 * Update a bookmark
 */
export async function updateBookmark(
  bookmarkId: string,
  userId: string,
  input: UpdateBookmarkInput,
): Promise<BookmarkWithRelations | null> {
  const { tagIds, collectionIds, ...bookmarkData } = input;

  // Update bookmark
  const result = await db
    .update(bookmarks)
    .set({
      ...bookmarkData,
      updatedAt: new Date(),
    })
    .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, userId)))
    .returning();

  if (!result[0]) {
    return null;
  }

  const bookmark = result[0];

  // Update tags if provided
  if (tagIds !== undefined) {
    // Remove existing tags
    await db
      .delete(bookmarkTags)
      .where(eq(bookmarkTags.bookmarkId, bookmarkId));

    // Add new tags
    if (tagIds.length > 0) {
      await db.insert(bookmarkTags).values(
        tagIds.map((tagId) => ({
          bookmarkId,
          tagId,
        })),
      );
    }
  }

  // Update collections if provided
  if (collectionIds !== undefined) {
    // Remove existing collections
    await db
      .delete(bookmarkCollections)
      .where(eq(bookmarkCollections.bookmarkId, bookmarkId));

    // Add new collections
    if (collectionIds.length > 0) {
      await db.insert(bookmarkCollections).values(
        collectionIds.map((collectionId) => ({
          bookmarkId,
          collectionId,
        })),
      );
    }
  }

  return fetchBookmarkRelations(bookmark);
}

/**
 * Delete a bookmark
 */
export async function deleteBookmark(
  bookmarkId: string,
  userId: string,
): Promise<boolean> {
  const result = await db
    .delete(bookmarks)
    .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, userId)))
    .returning();

  return result.length > 0;
}

/**
 * Archive/unarchive a bookmark
 */
export async function archiveBookmark(
  bookmarkId: string,
  userId: string,
  archived: boolean,
): Promise<Bookmark | null> {
  const result = await db
    .update(bookmarks)
    .set({
      isArchived: archived,
      updatedAt: new Date(),
    })
    .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, userId)))
    .returning();

  return result[0] ?? null;
}

/**
 * Pin/unpin a bookmark
 */
export async function pinBookmark(
  bookmarkId: string,
  userId: string,
  pinned: boolean,
): Promise<Bookmark | null> {
  const result = await db
    .update(bookmarks)
    .set({
      isPinned: pinned,
      updatedAt: new Date(),
    })
    .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, userId)))
    .returning();

  return result[0] ?? null;
}

/**
 * Bulk delete bookmarks
 */
export async function bulkDeleteBookmarks(
  userId: string,
  bookmarkIds: string[],
): Promise<number> {
  const result = await db
    .delete(bookmarks)
    .where(
      and(eq(bookmarks.userId, userId), inArray(bookmarks.id, bookmarkIds)),
    )
    .returning();

  return result.length;
}

/**
 * Bulk archive bookmarks
 */
export async function bulkArchiveBookmarks(
  userId: string,
  bookmarkIds: string[],
  archived: boolean,
): Promise<number> {
  const result = await db
    .update(bookmarks)
    .set({
      isArchived: archived,
      updatedAt: new Date(),
    })
    .where(
      and(eq(bookmarks.userId, userId), inArray(bookmarks.id, bookmarkIds)),
    )
    .returning();

  return result.length;
}

/**
 * Bulk move bookmarks to category
 */
export async function bulkMoveToCategory(
  userId: string,
  bookmarkIds: string[],
  categoryId: string | null,
): Promise<number> {
  const result = await db
    .update(bookmarks)
    .set({
      categoryId,
      updatedAt: new Date(),
    })
    .where(
      and(eq(bookmarks.userId, userId), inArray(bookmarks.id, bookmarkIds)),
    )
    .returning();

  return result.length;
}

/**
 * Get bookmarks count by category
 */
export async function getBookmarkCountsByCategory(
  userId: string,
): Promise<{ categoryId: string | null; count: number }[]> {
  const result = await db
    .select({
      categoryId: bookmarks.categoryId,
      count: count(),
    })
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId))
    .groupBy(bookmarks.categoryId);

  return result.map((r) => ({
    categoryId: r.categoryId,
    count: Number(r.count),
  }));
}

/**
 * Get recently created bookmarks
 */
export async function getRecentBookmarks(
  userId: string,
  limit = 10,
): Promise<Bookmark[]> {
  return db
    .select()
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId))
    .orderBy(desc(bookmarks.createdAt))
    .limit(limit);
}

/**
 * Get pinned bookmarks
 */
export async function getPinnedBookmarks(userId: string): Promise<Bookmark[]> {
  return db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.isPinned, true)))
    .orderBy(desc(bookmarks.updatedAt));
}

/**
 * Check if bookmark exists and belongs to user
 */
export async function bookmarkExists(
  bookmarkId: string,
  userId: string,
): Promise<boolean> {
  const result = await db
    .select({ id: bookmarks.id })
    .from(bookmarks)
    .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, userId)))
    .limit(1);

  return result.length > 0;
}

/**
 * Update bookmark metadata (from URL extraction)
 */
export async function updateBookmarkMetadata(
  bookmarkId: string,
  userId: string,
  metadata: {
    title?: string;
    description?: string;
    favicon?: string;
    ogImage?: string;
    ogTitle?: string;
    ogDescription?: string;
  },
): Promise<Bookmark | null> {
  const result = await db
    .update(bookmarks)
    .set({
      ...metadata,
      updatedAt: new Date(),
    })
    .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, userId)))
    .returning();

  return result[0] ?? null;
}

/**
 * Update AI-generated content
 */
export async function updateBookmarkAiContent(
  bookmarkId: string,
  userId: string,
  aiContent: {
    aiSummary?: string;
    aiTags?: string[];
    aiCategory?: string;
  },
): Promise<Bookmark | null> {
  const result = await db
    .update(bookmarks)
    .set({
      ...aiContent,
      aiProcessedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, userId)))
    .returning();

  return result[0] ?? null;
}
