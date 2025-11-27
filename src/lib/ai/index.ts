/**
 * AI Module
 *
 * Exports all AI-related functionality for bookmark processing.
 */

// Client
export {
  AI_CONFIG,
  AIError,
  type ChatCompletionOptions,
  type ChatCompletionResult,
  createChatCompletion,
  getGroqClient,
  parseJsonResponse,
} from "./client";
// Prompts
export {
  CATEGORY_SYSTEM_PROMPT,
  CONTENT_ANALYSIS_SYSTEM_PROMPT,
  createCategoryPrompt,
  createSemanticSearchPrompt,
  createSummaryPrompt,
  createTagsPrompt,
  SEMANTIC_SEARCH_SYSTEM_PROMPT,
  type SearchBookmark,
  SUMMARY_SYSTEM_PROMPT,
  TAGS_SYSTEM_PROMPT,
} from "./prompts";
// Queue
export {
  type AITask,
  type AITaskResult,
  type AITaskType,
  checkAIRateLimit,
  clearQueue,
  consumeAIRateLimit,
  dequeueTask,
  enqueueTask,
  generateTaskId,
  getQueueStatus,
  markTaskCompleted,
  markTaskStarted,
  QUEUE_CONFIG,
  TaskPriority,
} from "./queue";

// Services
export {
  type CategorySuggestionResult,
  generateSummary,
  processBookmarkWithAI,
  type SemanticSearchResult,
  type SummaryResult,
  semanticSearch,
  suggestCategory,
  suggestTags,
  type TagSuggestionsResult,
} from "./services";
