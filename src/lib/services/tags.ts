/**
 * Tags Service
 *
 * Business logic for tag CRUD operations.
 */

import { and, count, eq, ilike, sql } from "drizzle-orm";
import type { CreateTagInput, UpdateTagInput } from "@/schemas/tag.schema";
import { db } from "../db";
import { bookmarkTags, type NewTag, type Tag, tags } from "../db/schema";

/**
 * Get all tags for a user
 */
export async function getUserTags(userId: string): Promise<Tag[]> {
  return db
    .select()
    .from(tags)
    .where(eq(tags.userId, userId))
    .orderBy(tags.name);
}

/**
 * Get tags with bookmark counts
 */
export async function getUserTagsWithCounts(
  userId: string,
): Promise<(Tag & { bookmarkCount: number })[]> {
  const result = await db
    .select({
      id: tags.id,
      userId: tags.userId,
      name: tags.name,
      color: tags.color,
      createdAt: tags.createdAt,
      updatedAt: tags.updatedAt,
      bookmarkCount: count(bookmarkTags.bookmarkId),
    })
    .from(tags)
    .leftJoin(bookmarkTags, eq(bookmarkTags.tagId, tags.id))
    .where(eq(tags.userId, userId))
    .groupBy(tags.id)
    .orderBy(tags.name);

  return result.map((row) => ({
    ...row,
    bookmarkCount: Number(row.bookmarkCount),
  }));
}

/**
 * Get a single tag by ID
 */
export async function getTagById(
  tagId: string,
  userId: string,
): Promise<Tag | null> {
  const result = await db
    .select()
    .from(tags)
    .where(and(eq(tags.id, tagId), eq(tags.userId, userId)))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Get a tag by name (for checking duplicates)
 */
export async function getTagByName(
  name: string,
  userId: string,
): Promise<Tag | null> {
  const result = await db
    .select()
    .from(tags)
    .where(and(eq(tags.name, name.toLowerCase()), eq(tags.userId, userId)))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Create a new tag
 */
export async function createTag(
  userId: string,
  input: CreateTagInput,
): Promise<Tag> {
  const newTag: NewTag = {
    userId,
    name: input.name, // Already lowercase from schema transform
    color: input.color ?? null,
  };

  const result = await db.insert(tags).values(newTag).returning();

  return result[0]!;
}

/**
 * Update a tag
 */
export async function updateTag(
  tagId: string,
  userId: string,
  input: UpdateTagInput,
): Promise<Tag | null> {
  const result = await db
    .update(tags)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(and(eq(tags.id, tagId), eq(tags.userId, userId)))
    .returning();

  return result[0] ?? null;
}

/**
 * Delete a tag
 * Also removes tag from all bookmarks (via cascade)
 */
export async function deleteTag(
  tagId: string,
  userId: string,
): Promise<boolean> {
  const result = await db
    .delete(tags)
    .where(and(eq(tags.id, tagId), eq(tags.userId, userId)))
    .returning();

  return result.length > 0;
}

/**
 * Autocomplete tags by name prefix
 */
export async function autocompleteTag(
  userId: string,
  query: string,
  limit = 10,
): Promise<Tag[]> {
  return db
    .select()
    .from(tags)
    .where(
      and(eq(tags.userId, userId), ilike(tags.name, `${query.toLowerCase()}%`)),
    )
    .orderBy(tags.name)
    .limit(limit);
}

/**
 * Get tag cloud data (tags with normalized weights)
 */
export async function getTagCloud(
  userId: string,
  limit = 50,
): Promise<
  {
    id: string;
    name: string;
    color: string | null;
    count: number;
    weight: number;
  }[]
> {
  const result = await db
    .select({
      id: tags.id,
      name: tags.name,
      color: tags.color,
      count: count(bookmarkTags.bookmarkId),
    })
    .from(tags)
    .leftJoin(bookmarkTags, eq(bookmarkTags.tagId, tags.id))
    .where(eq(tags.userId, userId))
    .groupBy(tags.id)
    .orderBy(sql`count(${bookmarkTags.bookmarkId}) DESC`)
    .limit(limit);

  // Calculate normalized weights
  const counts = result.map((r) => Number(r.count));
  const maxCount = Math.max(...counts, 1);
  const minCount = Math.min(...counts, 0);
  const range = maxCount - minCount || 1;

  return result.map((row) => ({
    id: row.id,
    name: row.name,
    color: row.color,
    count: Number(row.count),
    weight: (Number(row.count) - minCount) / range,
  }));
}

/**
 * Get or create a tag by name
 */
export async function getOrCreateTag(
  userId: string,
  name: string,
  color?: string | null,
): Promise<Tag> {
  const normalizedName = name.toLowerCase().trim();

  const existing = await getTagByName(normalizedName, userId);
  if (existing) {
    return existing;
  }

  return createTag(userId, { name: normalizedName, color });
}

/**
 * Get or create multiple tags by name
 */
export async function getOrCreateTags(
  userId: string,
  names: string[],
): Promise<Tag[]> {
  const results: Tag[] = [];

  for (const name of names) {
    const tag = await getOrCreateTag(userId, name);
    results.push(tag);
  }

  return results;
}
