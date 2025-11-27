/**
 * AI Prompts Unit Tests (P4-015)
 *
 * Tests for AI prompt generation functions.
 */

import { describe, expect, it } from "vitest";
import {
  CATEGORY_SYSTEM_PROMPT,
  CONTENT_ANALYSIS_SYSTEM_PROMPT,
  createCategoryPrompt,
  createSemanticSearchPrompt,
  createSummaryPrompt,
  createTagsPrompt,
  SEMANTIC_SEARCH_SYSTEM_PROMPT,
  SUMMARY_SYSTEM_PROMPT,
  TAGS_SYSTEM_PROMPT,
} from "@/lib/ai/prompts";

describe("AI Prompts", () => {
  describe("System Prompts", () => {
    it("should have defined summary system prompt", () => {
      expect(SUMMARY_SYSTEM_PROMPT).toBeDefined();
      expect(SUMMARY_SYSTEM_PROMPT.length).toBeGreaterThan(50);
      expect(SUMMARY_SYSTEM_PROMPT).toContain("summary");
    });

    it("should have defined tags system prompt", () => {
      expect(TAGS_SYSTEM_PROMPT).toBeDefined();
      expect(TAGS_SYSTEM_PROMPT.length).toBeGreaterThan(50);
      expect(TAGS_SYSTEM_PROMPT).toContain("tag");
    });

    it("should have defined category system prompt", () => {
      expect(CATEGORY_SYSTEM_PROMPT).toBeDefined();
      expect(CATEGORY_SYSTEM_PROMPT.length).toBeGreaterThan(50);
      expect(CATEGORY_SYSTEM_PROMPT).toContain("category");
    });

    it("should have defined semantic search system prompt", () => {
      expect(SEMANTIC_SEARCH_SYSTEM_PROMPT).toBeDefined();
      expect(SEMANTIC_SEARCH_SYSTEM_PROMPT.length).toBeGreaterThan(50);
      expect(SEMANTIC_SEARCH_SYSTEM_PROMPT).toContain("search");
    });

    it("should have defined content analysis system prompt", () => {
      expect(CONTENT_ANALYSIS_SYSTEM_PROMPT).toBeDefined();
      expect(CONTENT_ANALYSIS_SYSTEM_PROMPT.length).toBeGreaterThan(50);
    });
  });

  describe("createSummaryPrompt", () => {
    it("should create prompt with title and URL", () => {
      const prompt = createSummaryPrompt({
        title: "Test Title",
        url: "https://example.com",
      });

      expect(prompt).toContain("Test Title");
      expect(prompt).toContain("https://example.com");
    });

    it("should include description when provided", () => {
      const prompt = createSummaryPrompt({
        title: "Test Title",
        url: "https://example.com",
        description: "This is a test description",
      });

      expect(prompt).toContain("This is a test description");
    });

    it("should include content when provided", () => {
      const prompt = createSummaryPrompt({
        title: "Test Title",
        url: "https://example.com",
        content: "Main article content here",
      });

      expect(prompt).toContain("Main article content here");
    });

    it("should handle all optional fields", () => {
      const prompt = createSummaryPrompt({
        title: "Complete Test",
        url: "https://example.com/article",
        description: "Full description",
        content: "Full content",
      });

      expect(prompt).toContain("Complete Test");
      expect(prompt).toContain("https://example.com/article");
      expect(prompt).toContain("Full description");
      expect(prompt).toContain("Full content");
    });
  });

  describe("createTagsPrompt", () => {
    it("should create prompt with title and URL", () => {
      const prompt = createTagsPrompt({
        title: "JavaScript Tutorial",
        url: "https://example.com/js",
      });

      expect(prompt).toContain("JavaScript Tutorial");
      expect(prompt).toContain("https://example.com/js");
    });

    it("should include existing tags when provided", () => {
      const prompt = createTagsPrompt({
        title: "Test",
        url: "https://example.com",
        existingTags: ["programming", "web", "tutorial"],
      });

      expect(prompt).toContain("programming");
      expect(prompt).toContain("web");
      expect(prompt).toContain("tutorial");
    });

    it("should handle empty existing tags", () => {
      const prompt = createTagsPrompt({
        title: "Test",
        url: "https://example.com",
        existingTags: [],
      });

      expect(prompt).toContain("Test");
    });
  });

  describe("createCategoryPrompt", () => {
    it("should create prompt with categories list", () => {
      const prompt = createCategoryPrompt({
        title: "React Guide",
        url: "https://example.com/react",
        categories: ["Technology", "Programming", "Design"],
      });

      expect(prompt).toContain("React Guide");
      expect(prompt).toContain("Technology");
      expect(prompt).toContain("Programming");
      expect(prompt).toContain("Design");
    });

    it("should include description when provided", () => {
      const prompt = createCategoryPrompt({
        title: "Test",
        url: "https://example.com",
        description: "A detailed description",
        categories: ["General"],
      });

      expect(prompt).toContain("A detailed description");
    });

    it("should handle single category", () => {
      const prompt = createCategoryPrompt({
        title: "Test",
        url: "https://example.com",
        categories: ["Uncategorized"],
      });

      expect(prompt).toContain("Uncategorized");
    });
  });

  describe("createSemanticSearchPrompt", () => {
    it("should create prompt with query and bookmarks", () => {
      const prompt = createSemanticSearchPrompt({
        query: "javascript tutorials",
        bookmarks: [
          { id: "1", title: "JS Basics", url: "https://example.com/js" },
          { id: "2", title: "React Guide", url: "https://example.com/react" },
        ],
      });

      expect(prompt).toContain("javascript tutorials");
      expect(prompt).toContain("JS Basics");
      expect(prompt).toContain("React Guide");
      expect(prompt).toContain("1");
      expect(prompt).toContain("2");
    });

    it("should include bookmark descriptions", () => {
      const prompt = createSemanticSearchPrompt({
        query: "test",
        bookmarks: [
          {
            id: "1",
            title: "Test",
            url: "https://example.com",
            description: "Bookmark description here",
          },
        ],
      });

      expect(prompt).toContain("Bookmark description here");
    });

    it("should include bookmark tags", () => {
      const prompt = createSemanticSearchPrompt({
        query: "test",
        bookmarks: [
          {
            id: "1",
            title: "Test",
            url: "https://example.com",
            tags: ["tag1", "tag2"],
          },
        ],
      });

      expect(prompt).toContain("tag1");
      expect(prompt).toContain("tag2");
    });

    it("should include bookmark category", () => {
      const prompt = createSemanticSearchPrompt({
        query: "test",
        bookmarks: [
          {
            id: "1",
            title: "Test",
            url: "https://example.com",
            category: "Technology",
          },
        ],
      });

      expect(prompt).toContain("Technology");
    });

    it("should handle empty bookmarks array", () => {
      const prompt = createSemanticSearchPrompt({
        query: "test query",
        bookmarks: [],
      });

      expect(prompt).toContain("test query");
    });
  });
});
