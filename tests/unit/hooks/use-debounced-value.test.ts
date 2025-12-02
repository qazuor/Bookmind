/**
 * useDebouncedValue Hook Tests (P10-003)
 *
 * Tests for debouncing utilities.
 */

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  useDebouncedCallback,
  useDebouncedValue,
} from "@/hooks/use-debounced-value";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedValue("initial", 500));

    expect(result.current).toBe("initial");
  });

  it("should debounce value updates", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: "initial", delay: 500 } },
    );

    expect(result.current).toBe("initial");

    // Update value
    rerender({ value: "updated", delay: 500 });

    // Value should still be initial before timeout
    expect(result.current).toBe("initial");

    // Advance time by 500ms
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Now value should be updated
    expect(result.current).toBe("updated");
  });

  it("should reset timer on rapid value changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: "a", delay: 300 } },
    );

    // Rapid updates
    rerender({ value: "b", delay: 300 });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "c", delay: 300 });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "d", delay: 300 });

    // Should still be initial value
    expect(result.current).toBe("a");

    // Wait for debounce to complete
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should be the last value
    expect(result.current).toBe("d");
  });

  it("should handle different delay values", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: "initial", delay: 100 } },
    );

    rerender({ value: "updated", delay: 100 });

    // Advance 50ms (half the delay)
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current).toBe("initial");

    // Advance remaining 50ms
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current).toBe("updated");
  });

  it("should work with numbers", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 0, delay: 200 } },
    );

    expect(result.current).toBe(0);

    rerender({ value: 42, delay: 200 });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe(42);
  });

  it("should work with objects", () => {
    const initialObj = { name: "John" };
    const updatedObj = { name: "Jane" };

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: initialObj, delay: 200 } },
    );

    expect(result.current).toBe(initialObj);

    rerender({ value: updatedObj, delay: 200 });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe(updatedObj);
  });

  it("should handle null values", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: "initial" as string | null, delay: 200 } },
    );

    rerender({ value: null, delay: 200 });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBeNull();
  });
});

describe("useDebouncedCallback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should debounce callback execution across render cycles", () => {
    const callback = vi.fn();

    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    // Call the debounced function
    act(() => {
      result.current();
    });

    // Callback should not be called yet
    expect(callback).not.toHaveBeenCalled();

    // Advance partial time and call again
    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      result.current();
    });

    // Advance remaining time from first call - callback should not fire
    // because the timer was reset
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(callback).not.toHaveBeenCalled();

    // Complete the second timer
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Callback should be called once
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should pass arguments to callback", () => {
    const callback = vi.fn();

    const { result } = renderHook(() =>
      useDebouncedCallback(callback as (value: string) => void, 200),
    );

    act(() => {
      (result.current as (value: string) => void)("test-arg");
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(callback).toHaveBeenCalledWith("test-arg");
  });

  it("should use latest arguments when called across render cycles", () => {
    const callback = vi.fn();

    const { result } = renderHook(() =>
      useDebouncedCallback(callback as (value: number) => void, 300),
    );

    // Call with first argument
    act(() => {
      (result.current as (value: number) => void)(1);
    });

    // Advance partial time
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Call with second argument (should cancel first)
    act(() => {
      (result.current as (value: number) => void)(2);
    });

    // Advance partial time
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Call with third argument (should cancel second)
    act(() => {
      (result.current as (value: number) => void)(3);
    });

    // Complete the timer
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should be called with the last argument
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(3);
  });

  it("should cancel previous timeout on new call", () => {
    const callback = vi.fn();

    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current();
    });

    // Wait partial time
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Call again
    act(() => {
      result.current();
    });

    // Wait another partial time
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Should not be called yet (timer was reset)
    expect(callback).not.toHaveBeenCalled();

    // Complete the remaining time
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should handle multiple arguments", () => {
    const callback = vi.fn();

    const { result } = renderHook(() =>
      useDebouncedCallback(
        callback as (a: string, b: number, c: boolean) => void,
        200,
      ),
    );

    act(() => {
      (result.current as (a: string, b: number, c: boolean) => void)(
        "hello",
        42,
        true,
      );
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(callback).toHaveBeenCalledWith("hello", 42, true);
  });
});
