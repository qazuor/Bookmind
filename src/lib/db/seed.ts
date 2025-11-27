/**
 * Database Seed Script
 *
 * Creates default categories and sample data for development.
 * Run with: pnpm db:seed
 *
 * This script is idempotent - it checks for existing data before inserting.
 */

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  bookmarkCollections,
  bookmarks,
  bookmarkTags,
  categories,
  collections,
  tags,
  users,
} from "./schema";

// Default categories that every user should have
const DEFAULT_CATEGORIES = [
  {
    name: "Technology",
    color: "#3b82f6",
    icon: "laptop",
    description: "Tech news, tutorials, and resources",
  },
  {
    name: "Design",
    color: "#ec4899",
    icon: "palette",
    description: "UI/UX, graphics, and design inspiration",
  },
  {
    name: "Business",
    color: "#10b981",
    icon: "briefcase",
    description: "Business news, startups, and finance",
  },
  {
    name: "News",
    color: "#f59e0b",
    icon: "newspaper",
    description: "Current events and news articles",
  },
  {
    name: "Entertainment",
    color: "#8b5cf6",
    icon: "film",
    description: "Movies, music, games, and fun",
  },
  {
    name: "Education",
    color: "#06b6d4",
    icon: "graduation-cap",
    description: "Learning resources and courses",
  },
  {
    name: "Other",
    color: "#6b7280",
    icon: "folder",
    description: "Miscellaneous bookmarks",
    isDefault: true,
  },
] as const;

// Sample data for development
const SAMPLE_USER = {
  email: "demo@bookmind.app",
  emailVerified: true,
  name: "Demo User",
  username: "demo",
  bio: "BookMind demo account for testing and development",
  language: "en",
  theme: "system",
  defaultVisibility: "private",
  emailNotifications: true,
} as const;

const SAMPLE_TAGS = [
  { name: "javascript", color: "#f7df1e" },
  { name: "typescript", color: "#3178c6" },
  { name: "react", color: "#61dafb" },
  { name: "nodejs", color: "#339933" },
  { name: "tutorial", color: "#10b981" },
  { name: "reference", color: "#6366f1" },
  { name: "tool", color: "#f59e0b" },
  { name: "article", color: "#ec4899" },
] as const;

const SAMPLE_COLLECTIONS = [
  {
    name: "Read Later",
    description: "Articles and resources to read when I have time",
  },
  {
    name: "Learning Path",
    description: "Courses and tutorials I'm working through",
  },
  { name: "Favorites", description: "My all-time favorite resources" },
] as const;

interface SampleBookmark {
  url: string;
  title: string;
  description: string;
  favicon?: string;
  ogTitle?: string;
  ogDescription?: string;
  categoryName: string;
  tags: string[];
  collections: string[];
  isPublic: boolean;
  isPinned: boolean;
}

const SAMPLE_BOOKMARKS: SampleBookmark[] = [
  {
    url: "https://react.dev",
    title: "React Documentation",
    description:
      "The official React documentation with guides and API reference",
    favicon: "https://react.dev/favicon.ico",
    ogTitle: "React",
    ogDescription: "The library for web and native user interfaces",
    categoryName: "Technology",
    tags: ["react", "javascript", "reference"],
    collections: ["Learning Path", "Favorites"],
    isPublic: false,
    isPinned: true,
  },
  {
    url: "https://www.typescriptlang.org/docs/",
    title: "TypeScript Documentation",
    description: "Official TypeScript documentation and handbook",
    favicon: "https://www.typescriptlang.org/favicon-32x32.png",
    ogTitle: "TypeScript: Documentation",
    categoryName: "Technology",
    tags: ["typescript", "reference"],
    collections: ["Learning Path"],
    isPublic: false,
    isPinned: false,
  },
  {
    url: "https://nodejs.org/docs/latest/api/",
    title: "Node.js API Documentation",
    description: "Complete API reference for Node.js",
    favicon: "https://nodejs.org/static/images/favicons/favicon.ico",
    categoryName: "Technology",
    tags: ["nodejs", "reference"],
    collections: [],
    isPublic: false,
    isPinned: false,
  },
  {
    url: "https://tailwindcss.com/docs",
    title: "Tailwind CSS Documentation",
    description: "A utility-first CSS framework documentation",
    favicon: "https://tailwindcss.com/favicons/favicon.ico",
    categoryName: "Design",
    tags: ["tool", "reference"],
    collections: ["Favorites"],
    isPublic: true,
    isPinned: true,
  },
  {
    url: "https://ui.shadcn.com/",
    title: "shadcn/ui",
    description:
      "Beautifully designed components built with Radix UI and Tailwind CSS",
    favicon: "https://ui.shadcn.com/favicon.ico",
    categoryName: "Design",
    tags: ["react", "tool"],
    collections: ["Favorites"],
    isPublic: true,
    isPinned: false,
  },
  {
    url: "https://www.joshwcomeau.com/",
    title: "Josh W Comeau Blog",
    description:
      "Friendly tutorials for developers. Focus on React, CSS, and web development",
    categoryName: "Education",
    tags: ["react", "tutorial", "article"],
    collections: ["Read Later"],
    isPublic: false,
    isPinned: false,
  },
  {
    url: "https://kentcdodds.com/blog",
    title: "Kent C. Dodds Blog",
    description: "Articles about JavaScript, React, and testing",
    categoryName: "Education",
    tags: ["javascript", "react", "article"],
    collections: ["Read Later"],
    isPublic: false,
    isPinned: false,
  },
  {
    url: "https://news.ycombinator.com/",
    title: "Hacker News",
    description:
      "Social news website focusing on computer science and entrepreneurship",
    categoryName: "News",
    tags: ["article"],
    collections: [],
    isPublic: false,
    isPinned: false,
  },
];

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
  }

  console.log("🌱 Starting database seed...\n");

  const sql = postgres(databaseUrl);
  const db = drizzle(sql);

  try {
    // Check if demo user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, SAMPLE_USER.email))
      .limit(1);

    let userId: string;

    if (existingUser.length > 0 && existingUser[0]) {
      console.log("✓ Demo user already exists, skipping user creation");
      userId = existingUser[0].id;
    } else {
      // Create demo user
      console.log("Creating demo user...");
      const result = await db
        .insert(users)
        .values(SAMPLE_USER)
        .returning({ id: users.id });
      const newUser = result[0];
      if (!newUser) {
        throw new Error("Failed to create demo user");
      }
      userId = newUser.id;
      console.log(`✓ Created demo user: ${SAMPLE_USER.email}`);
    }

    // Check if categories exist for user
    const existingCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId));

    const categoryMap = new Map<string, string>();

    if (existingCategories.length > 0) {
      console.log("✓ Categories already exist, skipping category creation");
      for (const cat of existingCategories) {
        categoryMap.set(cat.name, cat.id);
      }
    } else {
      // Create default categories
      console.log("Creating default categories...");
      for (const category of DEFAULT_CATEGORIES) {
        const result = await db
          .insert(categories)
          .values({
            userId,
            name: category.name,
            color: category.color,
            icon: category.icon,
            description: category.description,
            isDefault: "isDefault" in category ? category.isDefault : false,
          })
          .returning({ id: categories.id });
        const newCategory = result[0];
        if (newCategory) {
          categoryMap.set(category.name, newCategory.id);
        }
      }
      console.log(`✓ Created ${DEFAULT_CATEGORIES.length} categories`);
    }

    // Check if tags exist for user
    const existingTags = await db
      .select()
      .from(tags)
      .where(eq(tags.userId, userId));

    const tagMap = new Map<string, string>();

    if (existingTags.length > 0) {
      console.log("✓ Tags already exist, skipping tag creation");
      for (const tag of existingTags) {
        tagMap.set(tag.name, tag.id);
      }
    } else {
      // Create sample tags
      console.log("Creating sample tags...");
      for (const tag of SAMPLE_TAGS) {
        const result = await db
          .insert(tags)
          .values({
            userId,
            name: tag.name,
            color: tag.color,
          })
          .returning({ id: tags.id });
        const newTag = result[0];
        if (newTag) {
          tagMap.set(tag.name, newTag.id);
        }
      }
      console.log(`✓ Created ${SAMPLE_TAGS.length} tags`);
    }

    // Check if collections exist for user
    const existingCollections = await db
      .select()
      .from(collections)
      .where(eq(collections.userId, userId));

    const collectionMap = new Map<string, string>();

    if (existingCollections.length > 0) {
      console.log("✓ Collections already exist, skipping collection creation");
      for (const col of existingCollections) {
        collectionMap.set(col.name, col.id);
      }
    } else {
      // Create sample collections
      console.log("Creating sample collections...");
      for (const collection of SAMPLE_COLLECTIONS) {
        const result = await db
          .insert(collections)
          .values({
            userId,
            name: collection.name,
            description: collection.description,
          })
          .returning({ id: collections.id });
        const newCollection = result[0];
        if (newCollection) {
          collectionMap.set(collection.name, newCollection.id);
        }
      }
      console.log(`✓ Created ${SAMPLE_COLLECTIONS.length} collections`);
    }

    // Check if bookmarks exist for user
    const existingBookmarks = await db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId));

    if (existingBookmarks.length > 0) {
      console.log("✓ Bookmarks already exist, skipping bookmark creation");
    } else {
      // Create sample bookmarks with tags and collections
      console.log("Creating sample bookmarks...");
      for (const bookmark of SAMPLE_BOOKMARKS) {
        const categoryId = categoryMap.get(bookmark.categoryName);

        const result = await db
          .insert(bookmarks)
          .values({
            userId,
            url: bookmark.url,
            title: bookmark.title,
            description: bookmark.description,
            favicon: bookmark.favicon,
            ogTitle: bookmark.ogTitle,
            ogDescription: bookmark.ogDescription,
            categoryId,
            isPublic: bookmark.isPublic,
            isPinned: bookmark.isPinned,
            isArchived: false,
          })
          .returning({ id: bookmarks.id });

        const newBookmark = result[0];
        if (!newBookmark) {
          continue;
        }

        // Add tags to bookmark
        for (const tagName of bookmark.tags) {
          const tagId = tagMap.get(tagName);
          if (tagId) {
            await db.insert(bookmarkTags).values({
              bookmarkId: newBookmark.id,
              tagId,
            });
          }
        }

        // Add bookmark to collections
        for (const collectionName of bookmark.collections) {
          const collectionId = collectionMap.get(collectionName);
          if (collectionId) {
            await db.insert(bookmarkCollections).values({
              bookmarkId: newBookmark.id,
              collectionId,
            });
          }
        }
      }
      console.log(
        `✓ Created ${SAMPLE_BOOKMARKS.length} bookmarks with tags and collections`,
      );
    }

    console.log("\n🎉 Database seed completed successfully!");
    console.log("\nDemo account:");
    console.log(`  Email: ${SAMPLE_USER.email}`);
    console.log(`  Username: ${SAMPLE_USER.username}`);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run seed
seed();
