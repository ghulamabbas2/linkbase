import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { rateLimit } from "./rate-limit";

// rateLimit keeps per-key buckets in a module-level Map keyed by the string you
// pass. Every test uses a unique key so buckets never bleed across tests, which
// keeps them independent and order-agnostic.
function uniqueKey() {
  return `test:${Math.random().toString(36).slice(2)}:${performance.now()}`;
}

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows the first attempt for a fresh key", () => {
    expect(rateLimit(uniqueKey())).toBe(true);
  });

  it("allows attempts up to the limit, then throttles", () => {
    const key = uniqueKey();

    for (let i = 0; i < 5; i++) {
      expect(rateLimit(key, 5)).toBe(true);
    }
    expect(rateLimit(key, 5)).toBe(false);
    expect(rateLimit(key, 5)).toBe(false);
  });

  it("respects a custom limit", () => {
    const key = uniqueKey();

    expect(rateLimit(key, 2)).toBe(true);
    expect(rateLimit(key, 2)).toBe(true);
    expect(rateLimit(key, 2)).toBe(false);
  });

  it("resets once the window elapses", () => {
    const key = uniqueKey();

    expect(rateLimit(key, 1, 1_000)).toBe(true);
    expect(rateLimit(key, 1, 1_000)).toBe(false);

    vi.advanceTimersByTime(1_001);

    expect(rateLimit(key, 1, 1_000)).toBe(true);
  });

  it("keeps counts isolated between different keys", () => {
    const a = uniqueKey();
    const b = uniqueKey();

    expect(rateLimit(a, 1)).toBe(true);
    expect(rateLimit(a, 1)).toBe(false);
    // A different key has its own fresh bucket.
    expect(rateLimit(b, 1)).toBe(true);
  });
});
