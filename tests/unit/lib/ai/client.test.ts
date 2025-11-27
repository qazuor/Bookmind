/**
 * AI Client Unit Tests (P4-015)
 *
 * Tests for Groq client wrapper, error handling, and response parsing.
 */

import { describe, expect, it } from "vitest";
import { AI_CONFIG, AIError, parseJsonResponse } from "@/lib/ai/client";

describe("AI Client", () => {
  describe("AI_CONFIG", () => {
    it("should have correct default values", () => {
      expect(AI_CONFIG.model).toBe("llama-3.1-70b-versatile");
      expect(AI_CONFIG.fastModel).toBe("llama-3.1-8b-instant");
      expect(AI_CONFIG.maxTokens).toBe(500);
      expect(AI_CONFIG.temperature).toBe(0.3);
      expect(AI_CONFIG.timeout).toBe(30000);
      expect(AI_CONFIG.maxRetries).toBe(3);
      expect(AI_CONFIG.retryBaseDelay).toBe(1000);
    });
  });

  describe("AIError", () => {
    it("should create error with code and retryable flag", () => {
      const error = new AIError("Test error", "TEST_CODE", true);

      expect(error.message).toBe("Test error");
      expect(error.code).toBe("TEST_CODE");
      expect(error.retryable).toBe(true);
      expect(error.name).toBe("AIError");
    });

    it("should default retryable to false", () => {
      const error = new AIError("Test error", "TEST_CODE");

      expect(error.retryable).toBe(false);
    });

    it("should be instanceof Error", () => {
      const error = new AIError("Test", "CODE");

      expect(error instanceof Error).toBe(true);
      expect(error instanceof AIError).toBe(true);
    });
  });

  describe("parseJsonResponse", () => {
    it("should parse valid JSON", () => {
      const result = parseJsonResponse<{ name: string }>('{"name": "test"}');

      expect(result).toEqual({ name: "test" });
    });

    it("should parse JSON from markdown code block with language", () => {
      const result = parseJsonResponse<{ name: string }>(
        '```json\n{"name": "test"}\n```',
      );

      expect(result).toEqual({ name: "test" });
    });

    it("should parse JSON from code block without language", () => {
      const result = parseJsonResponse<{ name: string }>(
        '```\n{"name": "test"}\n```',
      );

      expect(result).toEqual({ name: "test" });
    });

    it("should return null for invalid JSON", () => {
      const result = parseJsonResponse<{ name: string }>("not json");

      expect(result).toBeNull();
    });

    it("should return null for empty content", () => {
      const result = parseJsonResponse<{ name: string }>("");

      expect(result).toBeNull();
    });

    it("should handle nested JSON objects", () => {
      const result = parseJsonResponse<{
        category: string;
        confidence: number;
        meta: { source: string };
      }>('{"category": "tech", "confidence": 0.9, "meta": {"source": "ai"}}');

      expect(result).toEqual({
        category: "tech",
        confidence: 0.9,
        meta: { source: "ai" },
      });
    });

    it("should handle JSON arrays", () => {
      const result = parseJsonResponse<string[]>('["a", "b", "c"]');

      expect(result).toEqual(["a", "b", "c"]);
    });

    it("should handle JSON with whitespace in code block", () => {
      const result = parseJsonResponse<{ tags: string[] }>(
        '```json\n  {\n    "tags": ["one", "two"]\n  }\n```',
      );

      expect(result).toEqual({ tags: ["one", "two"] });
    });

    it("should return null for invalid JSON in code block", () => {
      const result = parseJsonResponse<{ name: string }>(
        "```json\n{invalid json}\n```",
      );

      expect(result).toBeNull();
    });
  });
});
