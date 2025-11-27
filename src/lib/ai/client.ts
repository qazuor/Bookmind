/**
 * Groq AI Client Wrapper (P4-001)
 *
 * Provides a robust wrapper around the Groq SDK with:
 * - Automatic retries with exponential backoff
 * - Rate limiting
 * - Error handling
 * - Request timeout
 */

import Groq from "groq-sdk";

/**
 * AI Model configuration
 */
export const AI_CONFIG = {
  /** Primary model for general tasks */
  model: "llama-3.1-70b-versatile" as const,
  /** Faster model for simpler tasks */
  fastModel: "llama-3.1-8b-instant" as const,
  /** Default max tokens */
  maxTokens: 500,
  /** Default temperature (lower = more deterministic) */
  temperature: 0.3,
  /** Request timeout in milliseconds */
  timeout: 30000,
  /** Max retries for failed requests */
  maxRetries: 3,
  /** Base delay for exponential backoff (ms) */
  retryBaseDelay: 1000,
} as const;

/**
 * Custom error for AI operations
 */
export class AIError extends Error {
  readonly code: string;
  readonly retryable: boolean;

  constructor(message: string, code: string, retryable = false) {
    super(message);
    this.name = "AIError";
    this.code = code;
    this.retryable = retryable;
  }
}

/**
 * Groq client singleton
 */
let groqClient: Groq | null = null;

/**
 * Get or create Groq client
 */
export function getGroqClient(): Groq {
  if (groqClient) return groqClient;

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new AIError(
      "GROQ_API_KEY environment variable is not set",
      "MISSING_API_KEY",
      false,
    );
  }

  groqClient = new Groq({
    apiKey,
    timeout: AI_CONFIG.timeout,
    maxRetries: 0, // We handle retries ourselves
  });

  return groqClient;
}

/**
 * Chat completion request options
 */
export interface ChatCompletionOptions {
  /** System prompt */
  systemPrompt: string;
  /** User message */
  userMessage: string;
  /** Model to use (defaults to primary model) */
  model?: string;
  /** Max tokens to generate */
  maxTokens?: number;
  /** Temperature (0-1) */
  temperature?: number;
  /** Response format */
  responseFormat?: "text" | "json";
}

/**
 * Chat completion response
 */
export interface ChatCompletionResult {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(attempt: number): number {
  const delay = AI_CONFIG.retryBaseDelay * 2 ** attempt;
  // Add jitter (0-25% of delay)
  const jitter = delay * 0.25 * Math.random();
  return Math.min(delay + jitter, 30000); // Cap at 30 seconds
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    // Rate limits and server errors are retryable
    return (
      message.includes("rate limit") ||
      message.includes("429") ||
      message.includes("500") ||
      message.includes("502") ||
      message.includes("503") ||
      message.includes("timeout") ||
      message.includes("network")
    );
  }
  return false;
}

/**
 * Create a chat completion with automatic retries
 */
export async function createChatCompletion(
  options: ChatCompletionOptions,
): Promise<ChatCompletionResult> {
  const {
    systemPrompt,
    userMessage,
    model = AI_CONFIG.model,
    maxTokens = AI_CONFIG.maxTokens,
    temperature = AI_CONFIG.temperature,
    responseFormat = "text",
  } = options;

  const client = getGroqClient();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= AI_CONFIG.maxRetries; attempt++) {
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: maxTokens,
        temperature,
        response_format:
          responseFormat === "json" ? { type: "json_object" } : undefined,
      });

      const content = completion.choices[0]?.message?.content ?? "";
      const usage = completion.usage;

      return {
        content,
        usage: {
          promptTokens: usage?.prompt_tokens ?? 0,
          completionTokens: usage?.completion_tokens ?? 0,
          totalTokens: usage?.total_tokens ?? 0,
        },
        model: completion.model,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (isRetryableError(error) && attempt < AI_CONFIG.maxRetries) {
        const delay = getRetryDelay(attempt);
        // biome-ignore lint/suspicious/noConsole: Intentional retry logging
        console.warn(
          `[AI] Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${AI_CONFIG.maxRetries})`,
          lastError.message,
        );
        await sleep(delay);
        continue;
      }

      // Non-retryable error or max retries exceeded
      throw new AIError(
        `AI request failed: ${lastError.message}`,
        "REQUEST_FAILED",
        false,
      );
    }
  }

  // Should never reach here, but TypeScript needs this
  throw new AIError(
    `AI request failed after ${AI_CONFIG.maxRetries} retries: ${lastError?.message}`,
    "MAX_RETRIES_EXCEEDED",
    false,
  );
}

/**
 * Parse JSON response safely
 */
export function parseJsonResponse<T>(content: string): T | null {
  try {
    return JSON.parse(content) as T;
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch?.[1]) {
      try {
        return JSON.parse(jsonMatch[1].trim()) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
