/**
 * AI Services Unit Tests (P4-015)
 *
 * Tests for AI service functions with mocked dependencies.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AIError } from "@/lib/ai/client";

// Mock the modules before importing services
vi.mock("@/lib/ai/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/ai/client")>();
  return {
    ...actual,
    createChatCompletion: vi.fn(),
    getGroqClient: vi.fn(() => ({})),
  };
});

vi.mock("@/lib/ai/queue", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/ai/queue")>();
  return {
    ...actual,
    checkAIRateLimit: vi.fn(),
  };
});

// Import after mocking
import { createChatCompletion } from "@/lib/ai/client";
import { checkAIRateLimit } from "@/lib/ai/queue";
import {
  generateSummary,
  processBookmarkWithAI,
  semanticSearch,
  suggestCategory,
  suggestTags,
} from "@/lib/ai/services";

const mockCreateChatCompletion = vi.mocked(createChatCompletion);
const mockCheckAIRateLimit = vi.mocked(checkAIRateLimit);

describe("AI Services", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default to allowed rate limit
    mockCheckAIRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 10,
      resetAt: Date.now() + 60000,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("generateSummary", () => {
    it("should return empty summary for empty input", async () => {
      const result = await generateSummary("user-1", {
        title: "",
        url: "https://example.com",
      });

      expect(result.summary).toBe("");
      expect(result.tokensUsed).toBe(0);
      expect(mockCreateChatCompletion).not.toHaveBeenCalled();
    });

    it("should throw rate limit error when exceeded", async () => {
      mockCheckAIRateLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 30000,
      });

      await expect(
        generateSummary("user-1", {
          title: "Test",
          url: "https://example.com",
        }),
      ).rejects.toThrow(AIError);

      await expect(
        generateSummary("user-1", {
          title: "Test",
          url: "https://example.com",
        }),
      ).rejects.toThrow(/Rate limit exceeded/);
    });

    it("should generate summary with AI", async () => {
      mockCreateChatCompletion.mockResolvedValue({
        content: "This is a test summary about the article.",
        model: "gpt-3.5-turbo",
        usage: { promptTokens: 50, completionTokens: 20, totalTokens: 70 },
      });

      const result = await generateSummary("user-1", {
        title: "Test Article",
        url: "https://example.com/article",
        description: "An article about testing",
      });

      expect(result.summary).toBe("This is a test summary about the article.");
      expect(result.tokensUsed).toBe(70);
      expect(mockCreateChatCompletion).toHaveBeenCalledTimes(1);
    });

    it("should trim summary content", async () => {
      mockCreateChatCompletion.mockResolvedValue({
        content: "  Summary with whitespace  \n",
        model: "gpt-3.5-turbo",
        usage: { promptTokens: 50, completionTokens: 10, totalTokens: 60 },
      });

      const result = await generateSummary("user-1", {
        title: "Test",
        url: "https://example.com",
      });

      expect(result.summary).toBe("Summary with whitespace");
    });
  });

  describe("suggestTags", () => {
    it("should throw rate limit error when exceeded", async () => {
      mockCheckAIRateLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 30000,
      });

      await expect(
        suggestTags("user-1", {
          title: "Test",
          url: "https://example.com",
        }),
      ).rejects.toThrow(AIError);
    });

    it("should return tags from JSON response", async () => {
      mockCreateChatCompletion.mockResolvedValue({
        content:
          '{"tags": ["javascript", "tutorial", "web"], "reasoning": "Based on content"}',
        model: "gpt-3.5-turbo",
        usage: { promptTokens: 30, completionTokens: 15, totalTokens: 45 },
      });

      const result = await suggestTags("user-1", {
        title: "JavaScript Tutorial",
        url: "https://example.com/js",
      });

      expect(result.tags).toEqual(["javascript", "tutorial", "web"]);
      expect(result.reasoning).toBe("Based on content");
      expect(result.tokensUsed).toBe(45);
    });

    it("should handle non-JSON response gracefully", async () => {
      mockCreateChatCompletion.mockResolvedValue({
        content: "javascript, tutorial, web",
        model: "gpt-3.5-turbo",
        usage: { promptTokens: 30, completionTokens: 10, totalTokens: 40 },
      });

      const result = await suggestTags("user-1", {
        title: "JS Tutorial",
        url: "https://example.com",
      });

      expect(result.tags).toContain("javascript");
      expect(result.tags).toContain("tutorial");
      expect(result.tags).toContain("web");
    });

    it("should limit tags to 5", async () => {
      mockCreateChatCompletion.mockResolvedValue({
        content: '{"tags": ["a", "b", "c", "d", "e", "f", "g"]}',
        model: "gpt-3.5-turbo",
        usage: { promptTokens: 30, completionTokens: 20, totalTokens: 50 },
      });

      const result = await suggestTags("user-1", {
        title: "Test",
        url: "https://example.com",
      });

      expect(result.tags.length).toBeLessThanOrEqual(5);
    });

    it("should lowercase all tags", async () => {
      mockCreateChatCompletion.mockResolvedValue({
        content: '{"tags": ["JavaScript", "REACT", "WebDev"]}',
        model: "gpt-3.5-turbo",
        usage: { promptTokens: 30, completionTokens: 15, totalTokens: 45 },
      });

      const result = await suggestTags("user-1", {
        title: "Test",
        url: "https://example.com",
      });

      expect(result.tags).toEqual(["javascript", "react", "webdev"]);
    });
  });

  describe("suggestCategory", () => {
    it("should throw rate limit error when exceeded", async () => {
      mockCheckAIRateLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 30000,
      });

      await expect(
        suggestCategory("user-1", {
          title: "Test",
          url: "https://example.com",
          categories: ["Tech"],
        }),
      ).rejects.toThrow(AIError);
    });

    it("should return Other for empty categories", async () => {
      const result = await suggestCategory("user-1", {
        title: "Test",
        url: "https://example.com",
        categories: [],
      });

      expect(result.category).toBe("Other");
      expect(result.confidence).toBe(0);
      expect(result.tokensUsed).toBe(0);
      expect(mockCreateChatCompletion).not.toHaveBeenCalled();
    });

    it("should suggest category from provided list", async () => {
      mockCreateChatCompletion.mockResolvedValue({
        content:
          '{"category": "Technology", "confidence": 0.85, "reasoning": "Technical content"}',
        model: "gpt-3.5-turbo",
        usage: { promptTokens: 40, completionTokens: 20, totalTokens: 60 },
      });

      const result = await suggestCategory("user-1", {
        title: "React Guide",
        url: "https://example.com/react",
        categories: ["Technology", "Design", "Business"],
      });

      expect(result.category).toBe("Technology");
      expect(result.confidence).toBe(0.85);
      expect(result.tokensUsed).toBe(60);
    });

    it("should fallback to first category for invalid response", async () => {
      mockCreateChatCompletion.mockResolvedValue({
        content: "invalid response",
        model: "gpt-3.5-turbo",
        usage: { promptTokens: 40, completionTokens: 5, totalTokens: 45 },
      });

      const result = await suggestCategory("user-1", {
        title: "Test",
        url: "https://example.com",
        categories: ["First", "Second"],
      });

      expect(result.category).toBe("First");
      expect(result.confidence).toBe(0.3);
    });

    it("should clamp confidence between 0 and 1", async () => {
      mockCreateChatCompletion.mockResolvedValue({
        content: '{"category": "Tech", "confidence": 1.5}',
        model: "gpt-3.5-turbo",
        usage: { promptTokens: 40, completionTokens: 10, totalTokens: 50 },
      });

      const result = await suggestCategory("user-1", {
        title: "Test",
        url: "https://example.com",
        categories: ["Tech"],
      });

      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe("semanticSearch", () => {
    it("should throw rate limit error when exceeded", async () => {
      mockCheckAIRateLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 30000,
      });

      await expect(
        semanticSearch("user-1", {
          query: "test",
          bookmarks: [{ id: "1", title: "Test", url: "https://example.com" }],
        }),
      ).rejects.toThrow(AIError);
    });

    it("should return empty results for empty bookmarks", async () => {
      const result = await semanticSearch("user-1", {
        query: "test",
        bookmarks: [],
      });

      expect(result.results).toEqual([]);
      expect(result.tokensUsed).toBe(0);
      expect(mockCreateChatCompletion).not.toHaveBeenCalled();
    });

    it("should return ranked search results", async () => {
      mockCreateChatCompletion.mockResolvedValue({
        content: JSON.stringify({
          results: [
            { id: "1", score: 0.9, reason: "Direct match" },
            { id: "2", score: 0.7, reason: "Related content" },
          ],
          interpretation: "Looking for JavaScript resources",
        }),
        model: "gpt-3.5-turbo",
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      });

      const result = await semanticSearch("user-1", {
        query: "javascript tutorials",
        bookmarks: [
          { id: "1", title: "JS Guide", url: "https://example.com/js" },
          { id: "2", title: "React Intro", url: "https://example.com/react" },
          { id: "3", title: "CSS Tips", url: "https://example.com/css" },
        ],
      });

      expect(result.results.length).toBe(2);
      expect(result.results[0]?.id).toBe("1");
      expect(result.results[0]?.score).toBe(0.9);
      expect(result.interpretation).toBe("Looking for JavaScript resources");
      expect(result.tokensUsed).toBe(150);
    });

    it("should filter results with score below 0.3", async () => {
      mockCreateChatCompletion.mockResolvedValue({
        content: JSON.stringify({
          results: [
            { id: "1", score: 0.8 },
            { id: "2", score: 0.2 }, // Below threshold
            { id: "3", score: 0.5 },
          ],
        }),
        model: "gpt-3.5-turbo",
        usage: { promptTokens: 100, completionTokens: 40, totalTokens: 140 },
      });

      const result = await semanticSearch("user-1", {
        query: "test",
        bookmarks: [
          { id: "1", title: "A", url: "https://a.com" },
          { id: "2", title: "B", url: "https://b.com" },
          { id: "3", title: "C", url: "https://c.com" },
        ],
      });

      expect(result.results.length).toBe(2);
      expect(result.results.map((r) => r.id)).not.toContain("2");
    });

    it("should filter results with invalid IDs", async () => {
      mockCreateChatCompletion.mockResolvedValue({
        content: JSON.stringify({
          results: [
            { id: "1", score: 0.8 },
            { id: "999", score: 0.9 }, // Invalid ID
          ],
        }),
        model: "gpt-3.5-turbo",
        usage: { promptTokens: 100, completionTokens: 30, totalTokens: 130 },
      });

      const result = await semanticSearch("user-1", {
        query: "test",
        bookmarks: [{ id: "1", title: "A", url: "https://a.com" }],
      });

      expect(result.results.length).toBe(1);
      expect(result.results[0]?.id).toBe("1");
    });
  });

  describe("processBookmarkWithAI", () => {
    it("should process all AI features", async () => {
      // Mock successful responses
      mockCreateChatCompletion
        .mockResolvedValueOnce({
          content: "Generated summary",
          model: "gpt-3.5-turbo",
          usage: { promptTokens: 50, completionTokens: 20, totalTokens: 70 },
        })
        .mockResolvedValueOnce({
          content: '{"tags": ["tag1", "tag2"]}',
          model: "gpt-3.5-turbo",
          usage: { promptTokens: 30, completionTokens: 15, totalTokens: 45 },
        })
        .mockResolvedValueOnce({
          content: '{"category": "Tech", "confidence": 0.8}',
          model: "gpt-3.5-turbo",
          usage: { promptTokens: 40, completionTokens: 20, totalTokens: 60 },
        });

      const result = await processBookmarkWithAI("user-1", {
        title: "Test Article",
        url: "https://example.com",
        categories: ["Tech", "Other"],
      });

      expect(result.summary).toBe("Generated summary");
      expect(result.suggestedTags).toEqual(["tag1", "tag2"]);
      expect(result.suggestedCategory?.name).toBe("Tech");
      expect(result.tokensUsed).toBe(175);
    });

    it("should continue if individual operations fail", async () => {
      // Mock: summary fails, tags succeed, category succeeds
      mockCreateChatCompletion
        .mockRejectedValueOnce(new Error("Summary failed"))
        .mockResolvedValueOnce({
          content: '{"tags": ["tag1"]}',
          model: "gpt-3.5-turbo",
          usage: { promptTokens: 30, completionTokens: 10, totalTokens: 40 },
        })
        .mockResolvedValueOnce({
          content: '{"category": "Tech", "confidence": 0.9}',
          model: "gpt-3.5-turbo",
          usage: { promptTokens: 40, completionTokens: 15, totalTokens: 55 },
        });

      const result = await processBookmarkWithAI("user-1", {
        title: "Test",
        url: "https://example.com",
        categories: ["Tech"],
      });

      expect(result.summary).toBeUndefined();
      expect(result.suggestedTags).toEqual(["tag1"]);
      expect(result.suggestedCategory?.name).toBe("Tech");
    });

    it("should skip category suggestion if no categories provided", async () => {
      mockCreateChatCompletion
        .mockResolvedValueOnce({
          content: "Summary",
          model: "gpt-3.5-turbo",
          usage: { promptTokens: 50, completionTokens: 10, totalTokens: 60 },
        })
        .mockResolvedValueOnce({
          content: '{"tags": ["tag1"]}',
          model: "gpt-3.5-turbo",
          usage: { promptTokens: 30, completionTokens: 10, totalTokens: 40 },
        });

      const result = await processBookmarkWithAI("user-1", {
        title: "Test",
        url: "https://example.com",
        categories: [],
      });

      expect(result.suggestedCategory).toBeUndefined();
      // Only summary and tags calls, no category
      expect(mockCreateChatCompletion).toHaveBeenCalledTimes(2);
    });

    it("should not suggest category with low confidence", async () => {
      mockCreateChatCompletion
        .mockResolvedValueOnce({
          content: "Summary",
          model: "gpt-3.5-turbo",
          usage: { promptTokens: 50, completionTokens: 10, totalTokens: 60 },
        })
        .mockResolvedValueOnce({
          content: '{"tags": ["tag1"]}',
          model: "gpt-3.5-turbo",
          usage: { promptTokens: 30, completionTokens: 10, totalTokens: 40 },
        })
        .mockResolvedValueOnce({
          content: '{"category": "Tech", "confidence": 0.3}', // Below 0.5 threshold
          model: "gpt-3.5-turbo",
          usage: { promptTokens: 40, completionTokens: 15, totalTokens: 55 },
        });

      const result = await processBookmarkWithAI("user-1", {
        title: "Test",
        url: "https://example.com",
        categories: ["Tech"],
      });

      expect(result.suggestedCategory).toBeUndefined();
    });
  });
});
