/**
 * Collections Service
 *
 * Business logic for collection CRUD operations, sharing, and bookmark management.
 */

import crypto from "node:crypto";
import { and, count, eq, isNull, sql } from "drizzle-orm";
import type {
  CollectionShareInput,
  CollectionTree,
  CreateCollectionInput,
  UpdateCollectionInput,
} from "@/schemas/collection.schema";
import { db } from "../db";
import {
  bookmarkCollections,
  bookmarks,
  type Collection,
  collections,
  type NewCollection,
  users,
} from "../db/schema";

/**
 * Get all collections for a user (flat list)
 */
export async function getUserCollections(
  userId: string,
): Promise<Collection[]> {
  return db
    .select()
    .from(collections)
    .where(eq(collections.userId, userId))
    .orderBy(collections.name);
}

/**
 * Get collections with bookmark counts
 */
export async function getUserCollectionsWithCounts(
  userId: string,
): Promise<(Collection & { bookmarkCount: number })[]> {
  const result = await db
    .select({
      id: collections.id,
      userId: collections.userId,
      name: collections.name,
      description: collections.description,
      parentId: collections.parentId,
      isPublic: collections.isPublic,
      shareToken: collections.shareToken,
      shareExpiresAt: collections.shareExpiresAt,
      createdAt: collections.createdAt,
      updatedAt: collections.updatedAt,
      bookmarkCount: count(bookmarkCollections.bookmarkId),
    })
    .from(collections)
    .leftJoin(
      bookmarkCollections,
      eq(bookmarkCollections.collectionId, collections.id),
    )
    .where(eq(collections.userId, userId))
    .groupBy(collections.id)
    .orderBy(collections.name);

  return result.map((row) => ({
    ...row,
    bookmarkCount: Number(row.bookmarkCount),
  }));
}

/**
 * Get collection tree (nested structure)
 */
export async function getCollectionTree(
  userId: string,
): Promise<CollectionTree[]> {
  const allCollections = await getUserCollectionsWithCounts(userId);

  // Build tree structure
  const collectionsMap = new Map<string, CollectionTree>();
  const rootCollections: CollectionTree[] = [];

  // First pass: create all nodes
  for (const col of allCollections) {
    collectionsMap.set(col.id, {
      id: col.id,
      name: col.name,
      parentId: col.parentId,
      bookmarkCount: col.bookmarkCount,
      children: [],
    });
  }

  // Second pass: build hierarchy
  for (const col of allCollections) {
    const node = collectionsMap.get(col.id)!;
    if (col.parentId && collectionsMap.has(col.parentId)) {
      collectionsMap.get(col.parentId)!.children.push(node);
    } else {
      rootCollections.push(node);
    }
  }

  return rootCollections;
}

/**
 * Get a single collection by ID
 */
export async function getCollectionById(
  collectionId: string,
  userId: string,
): Promise<Collection | null> {
  const result = await db
    .select()
    .from(collections)
    .where(
      and(eq(collections.id, collectionId), eq(collections.userId, userId)),
    )
    .limit(1);

  return result[0] ?? null;
}

/**
 * Get collection with bookmark count
 */
export async function getCollectionWithCount(
  collectionId: string,
  userId: string,
): Promise<(Collection & { bookmarkCount: number }) | null> {
  const result = await db
    .select({
      id: collections.id,
      userId: collections.userId,
      name: collections.name,
      description: collections.description,
      parentId: collections.parentId,
      isPublic: collections.isPublic,
      shareToken: collections.shareToken,
      shareExpiresAt: collections.shareExpiresAt,
      createdAt: collections.createdAt,
      updatedAt: collections.updatedAt,
      bookmarkCount: count(bookmarkCollections.bookmarkId),
    })
    .from(collections)
    .leftJoin(
      bookmarkCollections,
      eq(bookmarkCollections.collectionId, collections.id),
    )
    .where(
      and(eq(collections.id, collectionId), eq(collections.userId, userId)),
    )
    .groupBy(collections.id)
    .limit(1);

  if (!result[0]) {
    return null;
  }

  return {
    ...result[0],
    bookmarkCount: Number(result[0].bookmarkCount),
  };
}

/**
 * Get a collection by name (for checking duplicates)
 */
export async function getCollectionByName(
  name: string,
  userId: string,
  parentId: string | null = null,
): Promise<Collection | null> {
  const conditions = [
    eq(collections.name, name),
    eq(collections.userId, userId),
  ];

  if (parentId) {
    conditions.push(eq(collections.parentId, parentId));
  } else {
    conditions.push(isNull(collections.parentId));
  }

  const result = await db
    .select()
    .from(collections)
    .where(and(...conditions))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Create a new collection
 */
export async function createCollection(
  userId: string,
  input: CreateCollectionInput,
): Promise<Collection> {
  const newCollection: NewCollection = {
    userId,
    name: input.name,
    description: input.description ?? null,
    parentId: input.parentId ?? null,
    isPublic: input.isPublic ?? false,
  };

  const result = await db.insert(collections).values(newCollection).returning();

  return result[0]!;
}

/**
 * Update a collection
 */
export async function updateCollection(
  collectionId: string,
  userId: string,
  input: UpdateCollectionInput,
): Promise<Collection | null> {
  const result = await db
    .update(collections)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(
      and(eq(collections.id, collectionId), eq(collections.userId, userId)),
    )
    .returning();

  return result[0] ?? null;
}

/**
 * Delete a collection
 * Also removes bookmarks from collection (via cascade on junction table)
 */
export async function deleteCollection(
  collectionId: string,
  userId: string,
): Promise<boolean> {
  const result = await db
    .delete(collections)
    .where(
      and(eq(collections.id, collectionId), eq(collections.userId, userId)),
    )
    .returning();

  return result.length > 0;
}

/**
 * Add bookmarks to a collection
 */
export async function addBookmarksToCollection(
  collectionId: string,
  userId: string,
  bookmarkIds: string[],
): Promise<number> {
  // Verify collection belongs to user
  const collection = await getCollectionById(collectionId, userId);
  if (!collection) {
    return 0;
  }

  // Filter to only bookmarks that belong to the user and aren't already in the collection
  const existingBookmarks = await db
    .select({ bookmarkId: bookmarkCollections.bookmarkId })
    .from(bookmarkCollections)
    .where(eq(bookmarkCollections.collectionId, collectionId));

  const existingIds = new Set(existingBookmarks.map((b) => b.bookmarkId));

  const userBookmarks = await db
    .select({ id: bookmarks.id })
    .from(bookmarks)
    .where(
      and(
        eq(bookmarks.userId, userId),
        sql`${bookmarks.id} = ANY(${bookmarkIds})`,
      ),
    );

  const validIds = userBookmarks
    .map((b) => b.id)
    .filter((id) => !existingIds.has(id));

  if (validIds.length === 0) {
    return 0;
  }

  // Insert new bookmark-collection relationships
  await db.insert(bookmarkCollections).values(
    validIds.map((bookmarkId) => ({
      bookmarkId,
      collectionId,
    })),
  );

  return validIds.length;
}

/**
 * Remove bookmarks from a collection
 */
export async function removeBookmarksFromCollection(
  collectionId: string,
  userId: string,
  bookmarkIds: string[],
): Promise<number> {
  // Verify collection belongs to user
  const collection = await getCollectionById(collectionId, userId);
  if (!collection) {
    return 0;
  }

  const result = await db
    .delete(bookmarkCollections)
    .where(
      and(
        eq(bookmarkCollections.collectionId, collectionId),
        sql`${bookmarkCollections.bookmarkId} = ANY(${bookmarkIds})`,
      ),
    )
    .returning();

  return result.length;
}

/**
 * Generate a share token for a collection
 */
export async function shareCollection(
  collectionId: string,
  userId: string,
  input?: CollectionShareInput,
): Promise<{ shareToken: string; shareExpiresAt: Date | null } | null> {
  // Verify collection belongs to user
  const collection = await getCollectionById(collectionId, userId);
  if (!collection) {
    return null;
  }

  const shareToken = crypto.randomBytes(32).toString("hex");
  const shareExpiresAt = input?.expiresAt ?? null;

  await db
    .update(collections)
    .set({
      shareToken,
      shareExpiresAt,
      isPublic: true,
      updatedAt: new Date(),
    })
    .where(
      and(eq(collections.id, collectionId), eq(collections.userId, userId)),
    );

  return { shareToken, shareExpiresAt };
}

/**
 * Revoke share for a collection
 */
export async function unshareCollection(
  collectionId: string,
  userId: string,
): Promise<boolean> {
  const result = await db
    .update(collections)
    .set({
      shareToken: null,
      shareExpiresAt: null,
      isPublic: false,
      updatedAt: new Date(),
    })
    .where(
      and(eq(collections.id, collectionId), eq(collections.userId, userId)),
    )
    .returning();

  return result.length > 0;
}

/**
 * Get a shared collection by token (public access)
 */
export async function getSharedCollection(shareToken: string): Promise<{
  collection: Collection;
  owner: { username: string; name: string | null; avatarUrl: string | null };
  bookmarkCount: number;
} | null> {
  const result = await db
    .select({
      collection: collections,
      ownerUsername: users.username,
      ownerName: users.name,
      ownerAvatarUrl: users.avatarUrl,
      bookmarkCount: count(bookmarkCollections.bookmarkId),
    })
    .from(collections)
    .innerJoin(users, eq(users.id, collections.userId))
    .leftJoin(
      bookmarkCollections,
      eq(bookmarkCollections.collectionId, collections.id),
    )
    .where(
      and(
        eq(collections.shareToken, shareToken),
        eq(collections.isPublic, true),
      ),
    )
    .groupBy(collections.id, users.id)
    .limit(1);

  if (!result[0]) {
    return null;
  }

  const {
    collection,
    ownerUsername,
    ownerName,
    ownerAvatarUrl,
    bookmarkCount,
  } = result[0];

  // Check if share has expired
  if (collection.shareExpiresAt && collection.shareExpiresAt < new Date()) {
    return null;
  }

  return {
    collection,
    owner: {
      username: ownerUsername ?? "anonymous",
      name: ownerName,
      avatarUrl: ownerAvatarUrl,
    },
    bookmarkCount: Number(bookmarkCount),
  };
}

/**
 * Get bookmarks in a shared collection
 */
export async function getSharedCollectionBookmarks(
  shareToken: string,
  limit = 50,
  offset = 0,
): Promise<
  {
    id: string;
    url: string;
    title: string;
    description: string | null;
    favicon: string | null;
    ogImage: string | null;
  }[]
> {
  const shared = await getSharedCollection(shareToken);
  if (!shared) {
    return [];
  }

  const result = await db
    .select({
      id: bookmarks.id,
      url: bookmarks.url,
      title: bookmarks.title,
      description: bookmarks.description,
      favicon: bookmarks.favicon,
      ogImage: bookmarks.ogImage,
    })
    .from(bookmarks)
    .innerJoin(
      bookmarkCollections,
      eq(bookmarkCollections.bookmarkId, bookmarks.id),
    )
    .where(eq(bookmarkCollections.collectionId, shared.collection.id))
    .orderBy(bookmarks.createdAt)
    .limit(limit)
    .offset(offset);

  return result;
}

/**
 * Check if a parent collection exists and belongs to user
 */
export async function validateParentCollection(
  parentId: string,
  userId: string,
): Promise<boolean> {
  const parent = await getCollectionById(parentId, userId);
  return parent !== null;
}

/**
 * Get child collections
 */
export async function getChildCollections(
  collectionId: string,
  userId: string,
): Promise<Collection[]> {
  return db
    .select()
    .from(collections)
    .where(
      and(
        eq(collections.parentId, collectionId),
        eq(collections.userId, userId),
      ),
    )
    .orderBy(collections.name);
}
