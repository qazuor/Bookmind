/**
 * HoneypotField Component Tests (P10-004)
 *
 * Tests for honeypot bot protection fields.
 */

import { act, render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  getHoneypotValues,
  HoneypotFields,
  useHoneypot,
} from "@/components/shared/HoneypotField";

describe("HoneypotFields", () => {
  it("should render hidden honeypot input", () => {
    render(<HoneypotFields />);

    const input = screen.getByLabelText("Website");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("name", "website");
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("autocomplete", "off");
    expect(input).toHaveAttribute("tabindex", "-1");
  });

  it("should render hidden timestamp input", () => {
    render(<HoneypotFields />);

    const timestampInput = document.querySelector('input[name="_timestamp"]');
    expect(timestampInput).toBeInTheDocument();
    expect(timestampInput).toHaveAttribute("type", "hidden");
  });

  it("should have aria-hidden on honeypot container", () => {
    render(<HoneypotFields />);

    const container = screen.getByLabelText("Website").closest("div");
    expect(container).toHaveAttribute("aria-hidden", "true");
  });

  it("should set timestamp on mount", async () => {
    const beforeMount = Date.now();

    render(<HoneypotFields />);

    // Wait for useEffect to run
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    const timestampInput = document.querySelector(
      'input[name="_timestamp"]',
    ) as HTMLInputElement;
    const timestamp = Number(timestampInput?.value);

    expect(timestamp).toBeGreaterThanOrEqual(beforeMount);
    expect(timestamp).toBeLessThanOrEqual(Date.now());
  });
});

describe("useHoneypot", () => {
  it("should return honeypot values", async () => {
    const { result } = renderHook(() => useHoneypot());

    // Wait for timestamp to be set
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(result.current.honeypotValues).toHaveProperty("website");
    expect(result.current.honeypotValues).toHaveProperty("_timestamp");
    expect(result.current.honeypotValues.website).toBe("");
    expect(typeof result.current.honeypotValues._timestamp).toBe("number");
  });

  it("should return HoneypotInputs component", () => {
    const { result } = renderHook(() => useHoneypot());

    const HoneypotInputs = result.current.HoneypotInputs;
    render(<HoneypotInputs />);

    expect(screen.getByLabelText("Website")).toBeInTheDocument();
  });

  it("should reset timestamp when resetTimestamp is called", async () => {
    const { result } = renderHook(() => useHoneypot());

    // Wait for initial timestamp
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    const initialTimestamp = result.current.timestamp;

    // Wait a bit and reset
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      result.current.resetTimestamp();
    });

    expect(result.current.timestamp).toBeGreaterThan(initialTimestamp ?? 0);
  });
});

describe("getHoneypotValues", () => {
  it("should return fresh honeypot values", () => {
    const beforeCall = Date.now();
    const values = getHoneypotValues();
    const afterCall = Date.now();

    expect(values).toHaveProperty("website", "");
    expect(values).toHaveProperty("_timestamp");
    expect(values._timestamp).toBeGreaterThanOrEqual(beforeCall);
    expect(values._timestamp).toBeLessThanOrEqual(afterCall);
  });

  it("should return new timestamp on each call", async () => {
    const values1 = getHoneypotValues();

    await new Promise((resolve) => setTimeout(resolve, 10));

    const values2 = getHoneypotValues();

    expect(values2._timestamp).toBeGreaterThan(values1._timestamp as number);
  });
});
