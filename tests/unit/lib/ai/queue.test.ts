/**
 * AI Queue Unit Tests (P4-015)
 *
 * Tests for AI request queue and rate limiting.
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  clearQueue,
  dequeueTask,
  enqueueTask,
  generateTaskId,
  getQueueStatus,
  markTaskCompleted,
  markTaskStarted,
  QUEUE_CONFIG,
  TaskPriority,
} from "@/lib/ai/queue";

describe("AI Queue", () => {
  beforeEach(() => {
    // Clear queue before each test
    clearQueue();
  });

  describe("QUEUE_CONFIG", () => {
    it("should have correct default values", () => {
      expect(QUEUE_CONFIG.maxConcurrent).toBe(5);
      expect(QUEUE_CONFIG.userRateLimit).toBe(20);
      expect(QUEUE_CONFIG.rateLimitWindow).toBe(60);
      expect(QUEUE_CONFIG.requestTimeout).toBe(60000);
    });
  });

  describe("TaskPriority", () => {
    it("should have correct priority values", () => {
      expect(TaskPriority.High).toBe(1);
      expect(TaskPriority.Normal).toBe(2);
      expect(TaskPriority.Low).toBe(3);
    });
  });

  describe("generateTaskId", () => {
    it("should generate unique IDs", () => {
      const id1 = generateTaskId();
      const id2 = generateTaskId();
      const id3 = generateTaskId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it("should generate valid format", () => {
      const id = generateTaskId();

      expect(typeof id).toBe("string");
      expect(id.startsWith("task_")).toBe(true);
    });
  });

  describe("enqueueTask", () => {
    it("should add task to queue and return id", () => {
      const taskId = enqueueTask({
        userId: "user-1",
        type: "summary",
        data: { title: "Test", url: "https://example.com" },
        priority: TaskPriority.Normal,
      });

      expect(typeof taskId).toBe("string");
      expect(taskId.startsWith("task_")).toBe(true);

      const status = getQueueStatus();
      expect(status.pending).toBe(1);
    });

    it("should add multiple tasks to queue", () => {
      enqueueTask({
        userId: "user-1",
        type: "summary",
        data: {},
        priority: TaskPriority.Normal,
      });
      enqueueTask({
        userId: "user-1",
        type: "tags",
        data: {},
        priority: TaskPriority.Normal,
      });

      const status = getQueueStatus();
      expect(status.pending).toBe(2);
    });
  });

  describe("dequeueTask", () => {
    it("should return null for empty queue", () => {
      const task = dequeueTask();

      expect(task).toBeNull();
    });

    it("should return highest priority task first", () => {
      enqueueTask({
        userId: "user-1",
        type: "tags",
        data: {},
        priority: TaskPriority.Low,
      });
      enqueueTask({
        userId: "user-1",
        type: "summary",
        data: {},
        priority: TaskPriority.High,
      });
      enqueueTask({
        userId: "user-1",
        type: "category",
        data: {},
        priority: TaskPriority.Normal,
      });

      const task = dequeueTask();

      expect(task?.type).toBe("summary");
      expect(task?.priority).toBe(TaskPriority.High);
    });

    it("should return tasks in FIFO order for same priority", () => {
      enqueueTask({
        userId: "user-1",
        type: "summary",
        data: { order: 1 },
        priority: TaskPriority.Normal,
      });
      enqueueTask({
        userId: "user-1",
        type: "tags",
        data: { order: 2 },
        priority: TaskPriority.Normal,
      });

      const task1 = dequeueTask();
      const task2 = dequeueTask();

      expect(task1?.type).toBe("summary");
      expect(task2?.type).toBe("tags");
    });

    it("should return null when max concurrent reached", () => {
      // Fill up active tasks
      for (let i = 0; i < QUEUE_CONFIG.maxConcurrent; i++) {
        markTaskStarted();
      }

      enqueueTask({
        userId: "user-1",
        type: "summary",
        data: {},
        priority: TaskPriority.Normal,
      });

      const task = dequeueTask();
      expect(task).toBeNull();
    });
  });

  describe("markTaskStarted / markTaskCompleted", () => {
    it("should track active task count", () => {
      enqueueTask({
        userId: "user-1",
        type: "summary",
        data: {},
        priority: TaskPriority.Normal,
      });

      markTaskStarted();
      let status = getQueueStatus();
      expect(status.active).toBe(1);

      markTaskCompleted();
      status = getQueueStatus();
      expect(status.active).toBe(0);
    });

    it("should not go below zero active tasks", () => {
      markTaskCompleted();
      markTaskCompleted();
      markTaskCompleted();

      const status = getQueueStatus();
      expect(status.active).toBe(0);
    });
  });

  describe("getQueueStatus", () => {
    it("should return empty status for empty queue", () => {
      const status = getQueueStatus();

      expect(status.pending).toBe(0);
      expect(status.active).toBe(0);
      expect(status.maxConcurrent).toBe(QUEUE_CONFIG.maxConcurrent);
    });

    it("should return correct counts", () => {
      enqueueTask({
        userId: "user-1",
        type: "summary",
        data: {},
        priority: TaskPriority.Normal,
      });
      enqueueTask({
        userId: "user-1",
        type: "tags",
        data: {},
        priority: TaskPriority.Normal,
      });
      enqueueTask({
        userId: "user-1",
        type: "category",
        data: {},
        priority: TaskPriority.Normal,
      });
      markTaskStarted();

      const status = getQueueStatus();

      expect(status.pending).toBe(3);
      expect(status.active).toBe(1);
    });
  });

  describe("clearQueue", () => {
    it("should remove all tasks", () => {
      enqueueTask({
        userId: "user-1",
        type: "summary",
        data: {},
        priority: TaskPriority.Normal,
      });
      enqueueTask({
        userId: "user-1",
        type: "tags",
        data: {},
        priority: TaskPriority.Normal,
      });
      enqueueTask({
        userId: "user-1",
        type: "category",
        data: {},
        priority: TaskPriority.Normal,
      });
      markTaskStarted();

      clearQueue();
      const status = getQueueStatus();

      expect(status.pending).toBe(0);
      expect(status.active).toBe(0);
    });
  });
});
