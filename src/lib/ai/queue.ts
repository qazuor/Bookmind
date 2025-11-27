/**
 * AI Request Queue (P4-002)
 *
 * Manages AI request processing with:
 * - Rate limiting per user
 * - Request queuing
 * - Priority handling
 * - Concurrent request limits
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Queue configuration
 */
export const QUEUE_CONFIG = {
  /** Max concurrent AI requests globally */
  maxConcurrent: 5,
  /** Rate limit: requests per minute per user */
  userRateLimit: 20,
  /** Rate limit window in seconds */
  rateLimitWindow: 60,
  /** Request timeout in milliseconds */
  requestTimeout: 60000,
} as const;

/**
 * AI task priorities
 */
export enum TaskPriority {
  /** User-initiated actions (regenerate, manual) */
  High = 1,
  /** Background processing (new bookmark) */
  Normal = 2,
  /** Batch processing */
  Low = 3,
}

/**
 * AI task types
 */
export type AITaskType = "summary" | "tags" | "category" | "search";

/**
 * AI task definition
 */
export interface AITask<T = unknown> {
  id: string;
  type: AITaskType;
  userId: string;
  priority: TaskPriority;
  data: T;
  createdAt: Date;
}

/**
 * Task result
 */
export interface AITaskResult<R = unknown> {
  taskId: string;
  success: boolean;
  result?: R;
  error?: string;
  processingTime: number;
}

// Redis client for rate limiting
let redis: Redis | null = null;
let rateLimiter: Ratelimit | null = null;

/**
 * Initialize Redis connection for rate limiting
 */
function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!(url && token)) {
    // biome-ignore lint/suspicious/noConsole: Intentional warning for missing config
    console.warn("[AI Queue] Redis not configured, rate limiting disabled");
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

/**
 * Get or create rate limiter
 */
function getRateLimiter(): Ratelimit | null {
  if (rateLimiter) return rateLimiter;

  const client = getRedis();
  if (!client) return null;

  rateLimiter = new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(
      QUEUE_CONFIG.userRateLimit,
      `${QUEUE_CONFIG.rateLimitWindow} s`,
    ),
    prefix: "ai:ratelimit",
    analytics: true,
  });

  return rateLimiter;
}

/**
 * Check if user can make AI request
 */
export async function checkAIRateLimit(
  userId: string,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const limiter = getRateLimiter();

  if (!limiter) {
    // No rate limiting if Redis not configured
    return {
      allowed: true,
      remaining: QUEUE_CONFIG.userRateLimit,
      resetAt: Date.now() + QUEUE_CONFIG.rateLimitWindow * 1000,
    };
  }

  const { success, remaining, reset } = await limiter.limit(userId);

  return {
    allowed: success,
    remaining,
    resetAt: reset,
  };
}

/**
 * Consume AI rate limit for user
 * Call this after successful AI request
 */
export async function consumeAIRateLimit(userId: string): Promise<void> {
  // Rate is already consumed by checkAIRateLimit
  // This function exists for explicit consumption if needed
  const limiter = getRateLimiter();
  if (limiter) {
    await limiter.limit(userId);
  }
}

// In-memory queue for simple processing
// In production, consider using a proper job queue like BullMQ
const taskQueue: AITask[] = [];
let activeTaskCount = 0;

/**
 * Add task to queue
 */
export function enqueueTask<T>(
  task: Omit<AITask<T>, "id" | "createdAt">,
): string {
  const id = `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const fullTask: AITask<T> = {
    ...task,
    id,
    createdAt: new Date(),
  };

  // Insert based on priority
  const insertIndex = taskQueue.findIndex((t) => t.priority > task.priority);
  if (insertIndex === -1) {
    taskQueue.push(fullTask as AITask);
  } else {
    taskQueue.splice(insertIndex, 0, fullTask as AITask);
  }

  return id;
}

/**
 * Get next task from queue
 */
export function dequeueTask(): AITask | null {
  if (taskQueue.length === 0) return null;
  if (activeTaskCount >= QUEUE_CONFIG.maxConcurrent) return null;

  return taskQueue.shift() ?? null;
}

/**
 * Mark task as started
 */
export function markTaskStarted(): void {
  activeTaskCount++;
}

/**
 * Mark task as completed
 */
export function markTaskCompleted(): void {
  activeTaskCount = Math.max(0, activeTaskCount - 1);
}

/**
 * Get queue status
 */
export function getQueueStatus(): {
  pending: number;
  active: number;
  maxConcurrent: number;
} {
  return {
    pending: taskQueue.length,
    active: activeTaskCount,
    maxConcurrent: QUEUE_CONFIG.maxConcurrent,
  };
}

/**
 * Clear all tasks from queue (for testing)
 */
export function clearQueue(): void {
  taskQueue.length = 0;
  activeTaskCount = 0;
}

/**
 * Generate unique task ID
 */
export function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
