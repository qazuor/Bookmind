import { getTableColumns, getTableName } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import {
  accounts,
  bookmarkCollections,
  bookmarks,
  bookmarkTags,
  categories,
  collections,
  sessions,
  tags,
  users,
  verificationTokens,
} from "@/lib/db/schema";

describe("Database Schema Structure", () => {
  describe("users table", () => {
    it("should have correct table name", () => {
      expect(getTableName(users)).toBe("users");
    });

    it("should have all required columns", () => {
      const columns = getTableColumns(users);
      const columnNames = Object.keys(columns);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("email");
      expect(columnNames).toContain("emailVerified");
      expect(columnNames).toContain("name");
      expect(columnNames).toContain("username");
      expect(columnNames).toContain("bio");
      expect(columnNames).toContain("avatarUrl");
      expect(columnNames).toContain("language");
      expect(columnNames).toContain("theme");
      expect(columnNames).toContain("defaultVisibility");
      expect(columnNames).toContain("emailNotifications");
      expect(columnNames).toContain("createdAt");
      expect(columnNames).toContain("updatedAt");
    });

    it("should have primary key on id", () => {
      const columns = getTableColumns(users);
      expect(columns.id.primary).toBe(true);
    });

    it("should have not null constraint on required fields", () => {
      const columns = getTableColumns(users);
      expect(columns.email.notNull).toBe(true);
      expect(columns.emailVerified.notNull).toBe(true);
      expect(columns.language.notNull).toBe(true);
      expect(columns.theme.notNull).toBe(true);
      expect(columns.defaultVisibility.notNull).toBe(true);
      expect(columns.emailNotifications.notNull).toBe(true);
    });

    it("should have nullable fields for optional data", () => {
      const columns = getTableColumns(users);
      expect(columns.name.notNull).toBe(false);
      expect(columns.username.notNull).toBe(false);
      expect(columns.bio.notNull).toBe(false);
      expect(columns.avatarUrl.notNull).toBe(false);
    });

    it("should have correct default values", () => {
      const columns = getTableColumns(users);
      expect(columns.emailVerified.hasDefault).toBe(true);
      expect(columns.language.hasDefault).toBe(true);
      expect(columns.theme.hasDefault).toBe(true);
      expect(columns.defaultVisibility.hasDefault).toBe(true);
      expect(columns.emailNotifications.hasDefault).toBe(true);
    });
  });

  describe("accounts table", () => {
    it("should have correct table name", () => {
      expect(getTableName(accounts)).toBe("accounts");
    });

    it("should have all required columns", () => {
      const columns = getTableColumns(accounts);
      const columnNames = Object.keys(columns);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("userId");
      expect(columnNames).toContain("provider");
      expect(columnNames).toContain("providerAccountId");
      expect(columnNames).toContain("accessToken");
      expect(columnNames).toContain("refreshToken");
      expect(columnNames).toContain("expiresAt");
      expect(columnNames).toContain("tokenType");
      expect(columnNames).toContain("scope");
      expect(columnNames).toContain("idToken");
    });

    it("should have foreign key to users", () => {
      const columns = getTableColumns(accounts);
      expect(columns.userId.notNull).toBe(true);
    });
  });

  describe("sessions table", () => {
    it("should have correct table name", () => {
      expect(getTableName(sessions)).toBe("sessions");
    });

    it("should have all required columns", () => {
      const columns = getTableColumns(sessions);
      const columnNames = Object.keys(columns);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("userId");
      expect(columnNames).toContain("token");
      expect(columnNames).toContain("expiresAt");
      expect(columnNames).toContain("ipAddress");
      expect(columnNames).toContain("userAgent");
    });

    it("should have not null on required fields", () => {
      const columns = getTableColumns(sessions);
      expect(columns.userId.notNull).toBe(true);
      expect(columns.token.notNull).toBe(true);
      expect(columns.expiresAt.notNull).toBe(true);
    });
  });

  describe("verificationTokens table", () => {
    it("should have correct table name", () => {
      expect(getTableName(verificationTokens)).toBe("verification_tokens");
    });

    it("should have all required columns", () => {
      const columns = getTableColumns(verificationTokens);
      const columnNames = Object.keys(columns);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("userId");
      expect(columnNames).toContain("token");
      expect(columnNames).toContain("type");
      expect(columnNames).toContain("expiresAt");
    });
  });

  describe("categories table", () => {
    it("should have correct table name", () => {
      expect(getTableName(categories)).toBe("categories");
    });

    it("should have all required columns", () => {
      const columns = getTableColumns(categories);
      const columnNames = Object.keys(columns);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("userId");
      expect(columnNames).toContain("name");
      expect(columnNames).toContain("color");
      expect(columnNames).toContain("icon");
      expect(columnNames).toContain("description");
      expect(columnNames).toContain("isDefault");
    });

    it("should have default color value", () => {
      const columns = getTableColumns(categories);
      expect(columns.color.hasDefault).toBe(true);
    });

    it("should have foreign key to users", () => {
      const columns = getTableColumns(categories);
      expect(columns.userId.notNull).toBe(true);
    });
  });

  describe("collections table", () => {
    it("should have correct table name", () => {
      expect(getTableName(collections)).toBe("collections");
    });

    it("should have all required columns", () => {
      const columns = getTableColumns(collections);
      const columnNames = Object.keys(columns);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("userId");
      expect(columnNames).toContain("name");
      expect(columnNames).toContain("description");
      expect(columnNames).toContain("parentId");
      expect(columnNames).toContain("isPublic");
      expect(columnNames).toContain("shareToken");
      expect(columnNames).toContain("shareExpiresAt");
    });

    it("should have nullable parentId for root collections", () => {
      const columns = getTableColumns(collections);
      expect(columns.parentId.notNull).toBe(false);
    });

    it("should have sharing fields nullable", () => {
      const columns = getTableColumns(collections);
      expect(columns.shareToken.notNull).toBe(false);
      expect(columns.shareExpiresAt.notNull).toBe(false);
    });
  });

  describe("tags table", () => {
    it("should have correct table name", () => {
      expect(getTableName(tags)).toBe("tags");
    });

    it("should have all required columns", () => {
      const columns = getTableColumns(tags);
      const columnNames = Object.keys(columns);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("userId");
      expect(columnNames).toContain("name");
      expect(columnNames).toContain("color");
    });

    it("should have nullable color", () => {
      const columns = getTableColumns(tags);
      expect(columns.color.notNull).toBe(false);
    });
  });

  describe("bookmarks table", () => {
    it("should have correct table name", () => {
      expect(getTableName(bookmarks)).toBe("bookmarks");
    });

    it("should have all required columns", () => {
      const columns = getTableColumns(bookmarks);
      const columnNames = Object.keys(columns);

      // Core fields
      expect(columnNames).toContain("id");
      expect(columnNames).toContain("userId");
      expect(columnNames).toContain("url");
      expect(columnNames).toContain("title");
      expect(columnNames).toContain("description");
      expect(columnNames).toContain("notes");

      // Metadata
      expect(columnNames).toContain("favicon");
      expect(columnNames).toContain("ogImage");
      expect(columnNames).toContain("ogTitle");
      expect(columnNames).toContain("ogDescription");

      // Category
      expect(columnNames).toContain("categoryId");

      // Status flags
      expect(columnNames).toContain("isPublic");
      expect(columnNames).toContain("isPinned");
      expect(columnNames).toContain("isArchived");

      // AI fields
      expect(columnNames).toContain("aiSummary");
      expect(columnNames).toContain("aiTags");
      expect(columnNames).toContain("aiCategory");
      expect(columnNames).toContain("aiProcessedAt");
    });

    it("should have not null on required fields", () => {
      const columns = getTableColumns(bookmarks);
      expect(columns.userId.notNull).toBe(true);
      expect(columns.url.notNull).toBe(true);
      expect(columns.title.notNull).toBe(true);
      expect(columns.isPublic.notNull).toBe(true);
      expect(columns.isPinned.notNull).toBe(true);
      expect(columns.isArchived.notNull).toBe(true);
    });

    it("should have nullable optional fields", () => {
      const columns = getTableColumns(bookmarks);
      expect(columns.description.notNull).toBe(false);
      expect(columns.notes.notNull).toBe(false);
      expect(columns.categoryId.notNull).toBe(false);
      expect(columns.aiSummary.notNull).toBe(false);
    });

    it("should have default values for boolean flags", () => {
      const columns = getTableColumns(bookmarks);
      expect(columns.isPublic.hasDefault).toBe(true);
      expect(columns.isPinned.hasDefault).toBe(true);
      expect(columns.isArchived.hasDefault).toBe(true);
    });
  });

  describe("bookmarkTags junction table", () => {
    it("should have correct table name", () => {
      expect(getTableName(bookmarkTags)).toBe("bookmark_tags");
    });

    it("should have composite primary key columns", () => {
      const columns = getTableColumns(bookmarkTags);
      const columnNames = Object.keys(columns);

      expect(columnNames).toContain("bookmarkId");
      expect(columnNames).toContain("tagId");
      expect(columnNames).toContain("createdAt");
    });

    it("should have not null on foreign keys", () => {
      const columns = getTableColumns(bookmarkTags);
      expect(columns.bookmarkId.notNull).toBe(true);
      expect(columns.tagId.notNull).toBe(true);
    });
  });

  describe("bookmarkCollections junction table", () => {
    it("should have correct table name", () => {
      expect(getTableName(bookmarkCollections)).toBe("bookmark_collections");
    });

    it("should have composite primary key columns", () => {
      const columns = getTableColumns(bookmarkCollections);
      const columnNames = Object.keys(columns);

      expect(columnNames).toContain("bookmarkId");
      expect(columnNames).toContain("collectionId");
      expect(columnNames).toContain("addedAt");
    });

    it("should have not null on foreign keys", () => {
      const columns = getTableColumns(bookmarkCollections);
      expect(columns.bookmarkId.notNull).toBe(true);
      expect(columns.collectionId.notNull).toBe(true);
    });
  });
});

describe("Column Count Validation", () => {
  it("users table should have 13 columns", () => {
    const columns = getTableColumns(users);
    expect(Object.keys(columns).length).toBe(13);
  });

  it("accounts table should have 12 columns", () => {
    const columns = getTableColumns(accounts);
    expect(Object.keys(columns).length).toBe(12);
  });

  it("sessions table should have 8 columns", () => {
    const columns = getTableColumns(sessions);
    expect(Object.keys(columns).length).toBe(8);
  });

  it("verificationTokens table should have 6 columns", () => {
    const columns = getTableColumns(verificationTokens);
    expect(Object.keys(columns).length).toBe(6);
  });

  it("categories table should have 9 columns", () => {
    const columns = getTableColumns(categories);
    expect(Object.keys(columns).length).toBe(9);
  });

  it("collections table should have 10 columns", () => {
    const columns = getTableColumns(collections);
    expect(Object.keys(columns).length).toBe(10);
  });

  it("tags table should have 6 columns", () => {
    const columns = getTableColumns(tags);
    expect(Object.keys(columns).length).toBe(6);
  });

  it("bookmarks table should have 20 columns", () => {
    const columns = getTableColumns(bookmarks);
    expect(Object.keys(columns).length).toBe(20);
  });

  it("bookmarkTags table should have 3 columns", () => {
    const columns = getTableColumns(bookmarkTags);
    expect(Object.keys(columns).length).toBe(3);
  });

  it("bookmarkCollections table should have 3 columns", () => {
    const columns = getTableColumns(bookmarkCollections);
    expect(Object.keys(columns).length).toBe(3);
  });
});
