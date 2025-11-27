/**
 * Stats Service
 *
 * Generate statistics and activity data for user dashboards.
 */

import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "../db";
import {
  bookmarkCollections,
  bookmarks,
  bookmarkTags,
  categories,
  collections,
  tags,
} from "../db/schema";

/**
 * User statistics overview
 */
export interface UserStats {
  totalBookmarks: number;
  publicBookmarks: number;
  archivedBookmarks: number;
  pinnedBookmarks: number;
  totalCategories: number;
  totalCollections: number;
  totalTags: number;
  bookmarksByCategory: {
    categoryId: string | null;
    categoryName: string;
    count: number;
  }[];
  bookmarksByVisibility: { isPublic: boolean; count: number }[];
}

/**
 * Activity data point
 */
export interface ActivityDataPoint {
  date: string;
  count: number;
}

/**
 * Get user statistics overview
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  // Total bookmarks
  const totalResult = await db
    .select({ count: count() })
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId));
  const totalBookmarks = Number(totalResult[0]?.count ?? 0);

  // Public bookmarks
  const publicResult = await db
    .select({ count: count() })
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.isPublic, true)));
  const publicBookmarks = Number(publicResult[0]?.count ?? 0);

  // Archived bookmarks
  const archivedResult = await db
    .select({ count: count() })
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.isArchived, true)));
  const archivedBookmarks = Number(archivedResult[0]?.count ?? 0);

  // Pinned bookmarks
  const pinnedResult = await db
    .select({ count: count() })
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.isPinned, true)));
  const pinnedBookmarks = Number(pinnedResult[0]?.count ?? 0);

  // Total categories
  const categoriesResult = await db
    .select({ count: count() })
    .from(categories)
    .where(eq(categories.userId, userId));
  const totalCategories = Number(categoriesResult[0]?.count ?? 0);

  // Total collections
  const collectionsResult = await db
    .select({ count: count() })
    .from(collections)
    .where(eq(collections.userId, userId));
  const totalCollections = Number(collectionsResult[0]?.count ?? 0);

  // Total tags
  const tagsResult = await db
    .select({ count: count() })
    .from(tags)
    .where(eq(tags.userId, userId));
  const totalTags = Number(tagsResult[0]?.count ?? 0);

  // Bookmarks by category
  const byCategoryResult = await db
    .select({
      categoryId: bookmarks.categoryId,
      categoryName: categories.name,
      count: count(),
    })
    .from(bookmarks)
    .leftJoin(categories, eq(categories.id, bookmarks.categoryId))
    .where(eq(bookmarks.userId, userId))
    .groupBy(bookmarks.categoryId, categories.name)
    .orderBy(desc(count()));

  const bookmarksByCategory = byCategoryResult.map((row) => ({
    categoryId: row.categoryId,
    categoryName: row.categoryName ?? "Uncategorized",
    count: Number(row.count),
  }));

  // Bookmarks by visibility
  const bookmarksByVisibility = [
    { isPublic: true, count: publicBookmarks },
    { isPublic: false, count: totalBookmarks - publicBookmarks },
  ];

  return {
    totalBookmarks,
    publicBookmarks,
    archivedBookmarks,
    pinnedBookmarks,
    totalCategories,
    totalCollections,
    totalTags,
    bookmarksByCategory,
    bookmarksByVisibility,
  };
}

/**
 * Get activity data for the last N days
 */
export async function getActivityData(
  userId: string,
  days = 30,
): Promise<ActivityDataPoint[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const result = await db
    .select({
      date: sql<string>`DATE(${bookmarks.createdAt})`,
      count: count(),
    })
    .from(bookmarks)
    .where(
      and(eq(bookmarks.userId, userId), gte(bookmarks.createdAt, startDate)),
    )
    .groupBy(sql`DATE(${bookmarks.createdAt})`)
    .orderBy(sql`DATE(${bookmarks.createdAt})`);

  // Fill in missing dates with 0
  const activityMap = new Map<string, number>();
  for (const row of result) {
    activityMap.set(row.date, Number(row.count));
  }

  const activity: ActivityDataPoint[] = [];
  const current = new Date(startDate);
  const today = new Date();

  while (current <= today) {
    const dateStr = current.toISOString().split("T")[0]!;
    activity.push({
      date: dateStr,
      count: activityMap.get(dateStr) ?? 0,
    });
    current.setDate(current.getDate() + 1);
  }

  return activity;
}

/**
 * Get top tags by usage
 */
export async function getTopTags(
  userId: string,
  limit = 10,
): Promise<{ tagId: string; tagName: string; count: number }[]> {
  const result = await db
    .select({
      tagId: tags.id,
      tagName: tags.name,
      count: count(bookmarkTags.bookmarkId),
    })
    .from(tags)
    .leftJoin(bookmarkTags, eq(bookmarkTags.tagId, tags.id))
    .where(eq(tags.userId, userId))
    .groupBy(tags.id)
    .orderBy(desc(count(bookmarkTags.bookmarkId)))
    .limit(limit);

  return result.map((row) => ({
    tagId: row.tagId,
    tagName: row.tagName,
    count: Number(row.count),
  }));
}

/**
 * Get top collections by bookmark count
 */
export async function getTopCollections(
  userId: string,
  limit = 10,
): Promise<{ collectionId: string; collectionName: string; count: number }[]> {
  const result = await db
    .select({
      collectionId: collections.id,
      collectionName: collections.name,
      count: count(bookmarkCollections.bookmarkId),
    })
    .from(collections)
    .leftJoin(
      bookmarkCollections,
      eq(bookmarkCollections.collectionId, collections.id),
    )
    .where(eq(collections.userId, userId))
    .groupBy(collections.id)
    .orderBy(desc(count(bookmarkCollections.bookmarkId)))
    .limit(limit);

  return result.map((row) => ({
    collectionId: row.collectionId,
    collectionName: row.collectionName,
    count: Number(row.count),
  }));
}
