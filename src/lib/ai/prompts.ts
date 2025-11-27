/**
 * AI Prompts (P4-003 to P4-006)
 *
 * System prompts and templates for AI operations:
 * - Summary generation
 * - Tag suggestions
 * - Category suggestions
 * - Semantic search
 */

/**
 * System prompt for summary generation (P4-003)
 */
export const SUMMARY_SYSTEM_PROMPT = `You are a helpful assistant that creates concise summaries of web content for a bookmarking application.

Your task is to generate a brief, informative summary that helps users quickly understand what a bookmarked page is about.

Guidelines:
- Keep summaries between 2-3 sentences (50-100 words)
- Focus on the main topic and key points
- Use clear, accessible language
- Avoid technical jargon unless necessary
- Do not include opinions or editorializing
- Do not mention the source/website name
- Write in third person

Respond with ONLY the summary text, no additional formatting or explanation.`;

/**
 * Create user prompt for summary generation
 */
export function createSummaryPrompt(input: {
  title: string;
  url: string;
  description?: string;
  content?: string;
}): string {
  const parts = [`Title: ${input.title}`, `URL: ${input.url}`];

  if (input.description) {
    parts.push(`Description: ${input.description}`);
  }

  if (input.content) {
    // Truncate content to avoid token limits
    const truncatedContent = input.content.slice(0, 2000);
    parts.push(
      `Content preview: ${truncatedContent}${input.content.length > 2000 ? "..." : ""}`,
    );
  }

  return parts.join("\n\n");
}

/**
 * System prompt for tag suggestions (P4-004)
 */
export const TAGS_SYSTEM_PROMPT = `You are a helpful assistant that suggests relevant tags for bookmarked web content.

Your task is to analyze the content and suggest 3-5 descriptive tags that would help users organize and find this bookmark later.

Guidelines:
- Suggest between 3-5 tags
- Tags should be lowercase, single words or short phrases (max 2-3 words)
- Use common, recognizable terms
- Consider the topic, type of content, and potential use cases
- Avoid overly specific or overly generic tags
- Prioritize tags that would be useful for categorization

Respond with a JSON object in this format:
{
  "tags": ["tag1", "tag2", "tag3"],
  "reasoning": "Brief explanation of why these tags were chosen"
}`;

/**
 * Create user prompt for tag suggestions
 */
export function createTagsPrompt(input: {
  title: string;
  url: string;
  description?: string;
  existingTags?: string[];
}): string {
  const parts = [`Title: ${input.title}`, `URL: ${input.url}`];

  if (input.description) {
    parts.push(`Description: ${input.description}`);
  }

  if (input.existingTags && input.existingTags.length > 0) {
    parts.push(
      `User's existing tags (for context): ${input.existingTags.join(", ")}`,
    );
    parts.push(
      "Try to use existing tags when appropriate, but don't force it.",
    );
  }

  return parts.join("\n\n");
}

/**
 * System prompt for category suggestions (P4-005)
 */
export const CATEGORY_SYSTEM_PROMPT = `You are a helpful assistant that categorizes bookmarked web content.

Your task is to analyze the content and suggest the most appropriate category from the user's existing categories.

Guidelines:
- Select exactly ONE category that best fits the content
- Consider the primary purpose and topic of the content
- If no category is a good fit, suggest "Other" or the closest match
- Provide a confidence score (0.0 to 1.0) for your suggestion
- Higher confidence means you're more certain about the match

Respond with a JSON object in this format:
{
  "category": "Category Name",
  "confidence": 0.85,
  "reasoning": "Brief explanation of why this category was chosen"
}`;

/**
 * Create user prompt for category suggestions
 */
export function createCategoryPrompt(input: {
  title: string;
  url: string;
  description?: string;
  categories: string[];
}): string {
  const parts = [`Title: ${input.title}`, `URL: ${input.url}`];

  if (input.description) {
    parts.push(`Description: ${input.description}`);
  }

  parts.push(`Available categories: ${input.categories.join(", ")}`);
  parts.push("Select the most appropriate category from the list above.");

  return parts.join("\n\n");
}

/**
 * System prompt for semantic search (P4-006)
 */
export const SEMANTIC_SEARCH_SYSTEM_PROMPT = `You are a helpful assistant that performs semantic search over a collection of bookmarks.

Your task is to analyze the user's search query and rank the provided bookmarks by relevance.

Guidelines:
- Consider semantic meaning, not just keyword matching
- Rank bookmarks from most to least relevant
- Include a relevance score (0.0 to 1.0) for each bookmark
- Only include bookmarks with relevance > 0.3
- Consider synonyms, related concepts, and user intent
- If no bookmarks are relevant, return an empty array

Respond with a JSON object in this format:
{
  "results": [
    { "id": "bookmark-id", "score": 0.95, "reason": "Brief explanation" },
    { "id": "bookmark-id", "score": 0.85, "reason": "Brief explanation" }
  ],
  "interpretation": "How you interpreted the search query"
}`;

/**
 * Bookmark for semantic search
 */
export interface SearchBookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  tags?: string[];
  category?: string;
}

/**
 * Create user prompt for semantic search
 */
export function createSemanticSearchPrompt(input: {
  query: string;
  bookmarks: SearchBookmark[];
}): string {
  const bookmarkList = input.bookmarks
    .map((b, i) => {
      const parts = [
        `${i + 1}. ID: ${b.id}`,
        `   Title: ${b.title}`,
        `   URL: ${b.url}`,
      ];
      if (b.description) parts.push(`   Description: ${b.description}`);
      if (b.tags && b.tags.length > 0)
        parts.push(`   Tags: ${b.tags.join(", ")}`);
      if (b.category) parts.push(`   Category: ${b.category}`);
      return parts.join("\n");
    })
    .join("\n\n");

  return `Search query: "${input.query}"\n\nBookmarks to search:\n${bookmarkList}`;
}

/**
 * System prompt for content analysis
 * Used as a fallback when other specialized prompts don't apply
 */
export const CONTENT_ANALYSIS_SYSTEM_PROMPT = `You are a helpful assistant that analyzes web content for a bookmarking application.

Analyze the provided content and extract:
- A brief summary (2-3 sentences)
- 3-5 relevant tags
- The main topic/category
- Key entities mentioned (people, organizations, technologies)

Respond with a JSON object in this format:
{
  "summary": "Brief summary of the content",
  "tags": ["tag1", "tag2", "tag3"],
  "topic": "Main topic",
  "entities": ["entity1", "entity2"]
}`;
