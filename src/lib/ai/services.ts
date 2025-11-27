/**
 * AI Services (P4-007 to P4-010)
 *
 * High-level AI functions for:
 * - Summary generation
 * - Tag suggestions
 * - Category suggestions
 * - Semantic search
 */

import {
  AI_CONFIG,
  AIError,
  createChatCompletion,
  parseJsonResponse,
} from "./client";
import {
  CATEGORY_SYSTEM_PROMPT,
  createCategoryPrompt,
  createSemanticSearchPrompt,
  createSummaryPrompt,
  createTagsPrompt,
  SEMANTIC_SEARCH_SYSTEM_PROMPT,
  type SearchBookmark,
  SUMMARY_SYSTEM_PROMPT,
  TAGS_SYSTEM_PROMPT,
} from "./prompts";
import { checkAIRateLimit } from "./queue";

/**
 * Summary generation result
 */
export interface SummaryResult {
  summary: string;
  tokensUsed: number;
}

/**
 * Tag suggestions result
 */
export interface TagSuggestionsResult {
  tags: string[];
  reasoning?: string;
  tokensUsed: number;
}

/**
 * Category suggestion result
 */
export interface CategorySuggestionResult {
  category: string;
  confidence: number;
  reasoning?: string;
  tokensUsed: number;
}

/**
 * Semantic search result
 */
export interface SemanticSearchResult {
  results: Array<{
    id: string;
    score: number;
    reason?: string;
  }>;
  interpretation?: string;
  tokensUsed: number;
}

/**
 * Generate a summary for a bookmark (P4-007)
 *
 * @param userId - User ID for rate limiting
 * @param input - Bookmark data to summarize
 * @returns Generated summary
 */
export async function generateSummary(
  userId: string,
  input: {
    title: string;
    url: string;
    description?: string;
    content?: string;
  },
): Promise<SummaryResult> {
  // Check rate limit
  const rateLimit = await checkAIRateLimit(userId);
  if (!rateLimit.allowed) {
    throw new AIError(
      `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetAt - Date.now()) / 1000)} seconds.`,
      "RATE_LIMITED",
      true,
    );
  }

  // Skip if no meaningful content
  if (!(input.title || input.description || input.content)) {
    return { summary: "", tokensUsed: 0 };
  }

  try {
    const result = await createChatCompletion({
      systemPrompt: SUMMARY_SYSTEM_PROMPT,
      userMessage: createSummaryPrompt(input),
      model: AI_CONFIG.model,
      maxTokens: 200,
      temperature: 0.3,
    });

    return {
      summary: result.content.trim(),
      tokensUsed: result.usage.totalTokens,
    };
  } catch (error) {
    if (error instanceof AIError) throw error;
    throw new AIError(
      `Failed to generate summary: ${error instanceof Error ? error.message : "Unknown error"}`,
      "SUMMARY_FAILED",
      true,
    );
  }
}

/**
 * Suggest tags for a bookmark (P4-008)
 *
 * @param userId - User ID for rate limiting
 * @param input - Bookmark data and existing tags
 * @returns Suggested tags
 */
export async function suggestTags(
  userId: string,
  input: {
    title: string;
    url: string;
    description?: string;
    existingTags?: string[];
  },
): Promise<TagSuggestionsResult> {
  // Check rate limit
  const rateLimit = await checkAIRateLimit(userId);
  if (!rateLimit.allowed) {
    throw new AIError(
      `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetAt - Date.now()) / 1000)} seconds.`,
      "RATE_LIMITED",
      true,
    );
  }

  try {
    const result = await createChatCompletion({
      systemPrompt: TAGS_SYSTEM_PROMPT,
      userMessage: createTagsPrompt(input),
      model: AI_CONFIG.fastModel, // Use faster model for tags
      maxTokens: 150,
      temperature: 0.4,
      responseFormat: "json",
    });

    const parsed = parseJsonResponse<{
      tags: string[];
      reasoning?: string;
    }>(result.content);

    if (!(parsed && Array.isArray(parsed.tags))) {
      // Fallback: try to extract tags from plain text
      const tags = result.content
        .split(/[,\n]/)
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0 && t.length <= 30)
        .slice(0, 5);

      return {
        tags,
        tokensUsed: result.usage.totalTokens,
      };
    }

    return {
      tags: parsed.tags.map((t) => t.toLowerCase().trim()).slice(0, 5),
      reasoning: parsed.reasoning,
      tokensUsed: result.usage.totalTokens,
    };
  } catch (error) {
    if (error instanceof AIError) throw error;
    throw new AIError(
      `Failed to suggest tags: ${error instanceof Error ? error.message : "Unknown error"}`,
      "TAGS_FAILED",
      true,
    );
  }
}

/**
 * Suggest a category for a bookmark (P4-009)
 *
 * @param userId - User ID for rate limiting
 * @param input - Bookmark data and available categories
 * @returns Suggested category with confidence
 */
export async function suggestCategory(
  userId: string,
  input: {
    title: string;
    url: string;
    description?: string;
    categories: string[];
  },
): Promise<CategorySuggestionResult> {
  // Check rate limit
  const rateLimit = await checkAIRateLimit(userId);
  if (!rateLimit.allowed) {
    throw new AIError(
      `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetAt - Date.now()) / 1000)} seconds.`,
      "RATE_LIMITED",
      true,
    );
  }

  // If no categories provided, return "Other"
  if (input.categories.length === 0) {
    return {
      category: "Other",
      confidence: 0,
      tokensUsed: 0,
    };
  }

  try {
    const result = await createChatCompletion({
      systemPrompt: CATEGORY_SYSTEM_PROMPT,
      userMessage: createCategoryPrompt(input),
      model: AI_CONFIG.fastModel, // Use faster model for categorization
      maxTokens: 150,
      temperature: 0.2, // Lower temperature for more consistent results
      responseFormat: "json",
    });

    const parsed = parseJsonResponse<{
      category: string;
      confidence: number;
      reasoning?: string;
    }>(result.content);

    if (!parsed?.category) {
      // Fallback to first category with low confidence
      return {
        category: input.categories[0] ?? "Other",
        confidence: 0.3,
        tokensUsed: result.usage.totalTokens,
      };
    }

    // Ensure category is from the provided list
    const matchedCategory = input.categories.find(
      (c) => c.toLowerCase() === parsed.category.toLowerCase(),
    );

    return {
      category: matchedCategory ?? input.categories[0] ?? "Other",
      confidence: Math.min(1, Math.max(0, parsed.confidence)),
      reasoning: parsed.reasoning,
      tokensUsed: result.usage.totalTokens,
    };
  } catch (error) {
    if (error instanceof AIError) throw error;
    throw new AIError(
      `Failed to suggest category: ${error instanceof Error ? error.message : "Unknown error"}`,
      "CATEGORY_FAILED",
      true,
    );
  }
}

/**
 * Perform semantic search over bookmarks (P4-010)
 *
 * @param userId - User ID for rate limiting
 * @param input - Search query and bookmarks to search
 * @returns Ranked search results
 */
export async function semanticSearch(
  userId: string,
  input: {
    query: string;
    bookmarks: SearchBookmark[];
  },
): Promise<SemanticSearchResult> {
  // Check rate limit
  const rateLimit = await checkAIRateLimit(userId);
  if (!rateLimit.allowed) {
    throw new AIError(
      `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetAt - Date.now()) / 1000)} seconds.`,
      "RATE_LIMITED",
      true,
    );
  }

  // Handle empty bookmarks
  if (input.bookmarks.length === 0) {
    return {
      results: [],
      tokensUsed: 0,
    };
  }

  // Limit bookmarks to prevent token overflow
  const maxBookmarks = 20;
  const bookmarksToSearch = input.bookmarks.slice(0, maxBookmarks);

  try {
    const result = await createChatCompletion({
      systemPrompt: SEMANTIC_SEARCH_SYSTEM_PROMPT,
      userMessage: createSemanticSearchPrompt({
        query: input.query,
        bookmarks: bookmarksToSearch,
      }),
      model: AI_CONFIG.model, // Use primary model for better understanding
      maxTokens: 500,
      temperature: 0.2,
      responseFormat: "json",
    });

    const parsed = parseJsonResponse<{
      results: Array<{
        id: string;
        score: number;
        reason?: string;
      }>;
      interpretation?: string;
    }>(result.content);

    if (!(parsed && Array.isArray(parsed.results))) {
      return {
        results: [],
        tokensUsed: result.usage.totalTokens,
      };
    }

    // Validate and filter results
    const validResults = parsed.results
      .filter((r) => {
        // Ensure the ID exists in our bookmarks
        const exists = bookmarksToSearch.some((b) => b.id === r.id);
        return exists && typeof r.score === "number" && r.score > 0.3;
      })
      .sort((a, b) => b.score - a.score)
      .map((r) => ({
        id: r.id,
        score: Math.min(1, Math.max(0, r.score)),
        reason: r.reason,
      }));

    return {
      results: validResults,
      interpretation: parsed.interpretation,
      tokensUsed: result.usage.totalTokens,
    };
  } catch (error) {
    if (error instanceof AIError) throw error;
    throw new AIError(
      `Failed to perform semantic search: ${error instanceof Error ? error.message : "Unknown error"}`,
      "SEARCH_FAILED",
      true,
    );
  }
}

/**
 * Process a new bookmark with all AI features
 * Called when a bookmark is created to generate summary, tags, and category
 */
export async function processBookmarkWithAI(
  userId: string,
  input: {
    title: string;
    url: string;
    description?: string;
    content?: string;
    existingTags?: string[];
    categories: string[];
  },
): Promise<{
  summary?: string;
  suggestedTags?: string[];
  suggestedCategory?: { name: string; confidence: number };
  tokensUsed: number;
}> {
  let totalTokens = 0;

  // Run all AI operations (could be parallelized but rate limits make it safer to run sequentially)
  const results: {
    summary?: string;
    suggestedTags?: string[];
    suggestedCategory?: { name: string; confidence: number };
  } = {};

  try {
    // Generate summary
    const summaryResult = await generateSummary(userId, {
      title: input.title,
      url: input.url,
      description: input.description,
      content: input.content,
    });
    results.summary = summaryResult.summary || undefined;
    totalTokens += summaryResult.tokensUsed;
  } catch (error) {
    // Log but don't fail the whole operation
    // biome-ignore lint/suspicious/noConsole: Intentional error logging
    console.error("[AI] Summary generation failed:", error);
  }

  try {
    // Suggest tags
    const tagsResult = await suggestTags(userId, {
      title: input.title,
      url: input.url,
      description: input.description,
      existingTags: input.existingTags,
    });
    results.suggestedTags =
      tagsResult.tags.length > 0 ? tagsResult.tags : undefined;
    totalTokens += tagsResult.tokensUsed;
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Intentional error logging
    console.error("[AI] Tag suggestion failed:", error);
  }

  try {
    // Suggest category
    if (input.categories.length > 0) {
      const categoryResult = await suggestCategory(userId, {
        title: input.title,
        url: input.url,
        description: input.description,
        categories: input.categories,
      });
      if (categoryResult.confidence > 0.5) {
        results.suggestedCategory = {
          name: categoryResult.category,
          confidence: categoryResult.confidence,
        };
      }
      totalTokens += categoryResult.tokensUsed;
    }
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Intentional error logging
    console.error("[AI] Category suggestion failed:", error);
  }

  return {
    ...results,
    tokensUsed: totalTokens,
  };
}
