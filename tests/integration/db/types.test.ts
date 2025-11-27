import { describe, expect, it } from "vitest";
import type {
  Account,
  Bookmark,
  BookmarkCollection,
  BookmarkTag,
  Category,
  Collection,
  NewAccount,
  NewBookmark,
  NewBookmarkCollection,
  NewBookmarkTag,
  NewCategory,
  NewCollection,
  NewSession,
  NewTag,
  NewUser,
  NewVerificationToken,
  Session,
  Tag,
  User,
  VerificationToken,
} from "@/lib/db/schema";

/**
 * These tests verify that type exports are properly defined
 * by creating valid objects that match the expected types.
 * If types are incorrect, TypeScript will fail to compile.
 */

describe("Type Inference - User Types", () => {
  it("User type should have correct shape", () => {
    const user: User = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "test@example.com",
      emailVerified: false,
      name: "Test User",
      username: "testuser",
      bio: "A test bio",
      avatarUrl: "https://example.com/avatar.jpg",
      language: "en",
      theme: "system",
      defaultVisibility: "private",
      emailNotifications: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(user.id).toBeDefined();
    expect(user.email).toBe("test@example.com");
  });

  it("NewUser type should allow optional fields", () => {
    const newUser: NewUser = {
      email: "new@example.com",
    };

    expect(newUser.email).toBe("new@example.com");
    expect(newUser.name).toBeUndefined();
  });
});

describe("Type Inference - Auth Types", () => {
  it("Account type should have correct shape", () => {
    const account: Account = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      userId: "123e4567-e89b-12d3-a456-426614174001",
      provider: "google",
      providerAccountId: "google-123",
      accessToken: "access-token",
      refreshToken: "refresh-token",
      expiresAt: new Date(),
      tokenType: "Bearer",
      scope: "email profile",
      idToken: "id-token",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(account.provider).toBe("google");
  });

  it("NewAccount type should require provider fields", () => {
    const newAccount: NewAccount = {
      userId: "123e4567-e89b-12d3-a456-426614174001",
      provider: "github",
      providerAccountId: "github-456",
    };

    expect(newAccount.provider).toBe("github");
  });

  it("Session type should have correct shape", () => {
    const session: Session = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      userId: "123e4567-e89b-12d3-a456-426614174001",
      token: "session-token",
      expiresAt: new Date(),
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(session.token).toBeDefined();
  });

  it("NewSession type should require token and expiresAt", () => {
    const newSession: NewSession = {
      userId: "123e4567-e89b-12d3-a456-426614174001",
      token: "new-session-token",
      expiresAt: new Date(),
    };

    expect(newSession.token).toBe("new-session-token");
  });

  it("VerificationToken type should have correct shape", () => {
    const token: VerificationToken = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      userId: "123e4567-e89b-12d3-a456-426614174001",
      token: "verification-token",
      type: "email_verification",
      expiresAt: new Date(),
      createdAt: new Date(),
    };

    expect(token.type).toBe("email_verification");
  });

  it("NewVerificationToken type should require token, type, and expiresAt", () => {
    const newToken: NewVerificationToken = {
      userId: "123e4567-e89b-12d3-a456-426614174001",
      token: "new-verification-token",
      type: "password_reset",
      expiresAt: new Date(),
    };

    expect(newToken.type).toBe("password_reset");
  });
});

describe("Type Inference - Category Types", () => {
  it("Category type should have correct shape", () => {
    const category: Category = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      userId: "123e4567-e89b-12d3-a456-426614174001",
      name: "Development",
      color: "#6366f1",
      icon: "code",
      description: "Development resources",
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(category.name).toBe("Development");
  });

  it("NewCategory type should only require name and userId", () => {
    const newCategory: NewCategory = {
      userId: "123e4567-e89b-12d3-a456-426614174001",
      name: "New Category",
    };

    expect(newCategory.name).toBe("New Category");
  });
});

describe("Type Inference - Collection Types", () => {
  it("Collection type should have correct shape", () => {
    const collection: Collection = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      userId: "123e4567-e89b-12d3-a456-426614174001",
      name: "My Collection",
      description: "A collection of bookmarks",
      parentId: null,
      isPublic: false,
      shareToken: null,
      shareExpiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(collection.name).toBe("My Collection");
  });

  it("NewCollection type should allow nesting via parentId", () => {
    const nestedCollection: NewCollection = {
      userId: "123e4567-e89b-12d3-a456-426614174001",
      name: "Nested Collection",
      parentId: "123e4567-e89b-12d3-a456-426614174000",
    };

    expect(nestedCollection.parentId).toBeDefined();
  });
});

describe("Type Inference - Tag Types", () => {
  it("Tag type should have correct shape", () => {
    const tag: Tag = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      userId: "123e4567-e89b-12d3-a456-426614174001",
      name: "javascript",
      color: "#f7df1e",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(tag.name).toBe("javascript");
  });

  it("NewTag type should only require name and userId", () => {
    const newTag: NewTag = {
      userId: "123e4567-e89b-12d3-a456-426614174001",
      name: "react",
    };

    expect(newTag.name).toBe("react");
  });
});

describe("Type Inference - Bookmark Types", () => {
  it("Bookmark type should have correct shape", () => {
    const bookmark: Bookmark = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      userId: "123e4567-e89b-12d3-a456-426614174001",
      url: "https://example.com",
      title: "Example Site",
      description: "An example website",
      notes: "Personal notes",
      favicon: "https://example.com/favicon.ico",
      ogImage: "https://example.com/og-image.jpg",
      ogTitle: "Example OG Title",
      ogDescription: "Example OG Description",
      categoryId: "123e4567-e89b-12d3-a456-426614174002",
      isPublic: false,
      isPinned: false,
      isArchived: false,
      aiSummary: "AI generated summary",
      aiTags: ["tech", "development"],
      aiCategory: "Technology",
      aiProcessedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(bookmark.url).toBe("https://example.com");
    expect(bookmark.aiTags).toHaveLength(2);
  });

  it("NewBookmark type should only require url, title, and userId", () => {
    const newBookmark: NewBookmark = {
      userId: "123e4567-e89b-12d3-a456-426614174001",
      url: "https://new-site.com",
      title: "New Site",
    };

    expect(newBookmark.url).toBe("https://new-site.com");
  });
});

describe("Type Inference - Junction Table Types", () => {
  it("BookmarkTag type should have correct shape", () => {
    const bookmarkTag: BookmarkTag = {
      bookmarkId: "123e4567-e89b-12d3-a456-426614174000",
      tagId: "123e4567-e89b-12d3-a456-426614174001",
      createdAt: new Date(),
    };

    expect(bookmarkTag.bookmarkId).toBeDefined();
    expect(bookmarkTag.tagId).toBeDefined();
  });

  it("NewBookmarkTag type should require both IDs", () => {
    const newBookmarkTag: NewBookmarkTag = {
      bookmarkId: "123e4567-e89b-12d3-a456-426614174000",
      tagId: "123e4567-e89b-12d3-a456-426614174001",
    };

    expect(newBookmarkTag.bookmarkId).toBeDefined();
    expect(newBookmarkTag.tagId).toBeDefined();
  });

  it("BookmarkCollection type should have correct shape", () => {
    const bookmarkCollection: BookmarkCollection = {
      bookmarkId: "123e4567-e89b-12d3-a456-426614174000",
      collectionId: "123e4567-e89b-12d3-a456-426614174001",
      addedAt: new Date(),
    };

    expect(bookmarkCollection.bookmarkId).toBeDefined();
    expect(bookmarkCollection.collectionId).toBeDefined();
  });

  it("NewBookmarkCollection type should require both IDs", () => {
    const newBookmarkCollection: NewBookmarkCollection = {
      bookmarkId: "123e4567-e89b-12d3-a456-426614174000",
      collectionId: "123e4567-e89b-12d3-a456-426614174001",
    };

    expect(newBookmarkCollection.bookmarkId).toBeDefined();
    expect(newBookmarkCollection.collectionId).toBeDefined();
  });
});
