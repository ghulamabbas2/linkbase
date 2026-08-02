import { describe, expect, it } from "vitest";
import { z } from "zod";

import { selectHandleSchema } from "./handle";

// Helper mirroring how the Server Actions read field errors (app/onboarding/actions.ts).
function fieldErrors(error: z.ZodError) {
  return z.flattenError(error).fieldErrors;
}

describe("selectHandleSchema", () => {
  it("accepts a valid handle", () => {
    const result = selectHandleSchema.safeParse({ handle: "cool_name-99" });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ handle: "cool_name-99" });
  });

  it("trims and lowercases the handle", () => {
    const result = selectHandleSchema.safeParse({ handle: "  CoolName  " });

    expect(result.success).toBe(true);
    expect(result.data?.handle).toBe("coolname");
  });

  it("accepts the minimum length of 3 characters", () => {
    const result = selectHandleSchema.safeParse({ handle: "abc" });

    expect(result.success).toBe(true);
  });

  it("accepts the maximum length of 30 characters", () => {
    const result = selectHandleSchema.safeParse({ handle: "a".repeat(30) });

    expect(result.success).toBe(true);
  });

  it("rejects a handle shorter than 3 characters", () => {
    const result = selectHandleSchema.safeParse({ handle: "ab" });

    expect(result.success).toBe(false);
    expect(fieldErrors(result.error!).handle).toContain(
      "Username must be at least 3 characters",
    );
  });

  it("rejects a handle longer than 30 characters", () => {
    const result = selectHandleSchema.safeParse({ handle: "a".repeat(31) });

    expect(result.success).toBe(false);
    expect(fieldErrors(result.error!).handle).toContain(
      "Username must be at most 30 characters",
    );
  });

  it("rejects disallowed characters", () => {
    const result = selectHandleSchema.safeParse({ handle: "bad name!" });

    expect(result.success).toBe(false);
    expect(fieldErrors(result.error!).handle).toContain(
      "Use lowercase letters, numbers, hyphens, and underscores only",
    );
  });

  it("rejects a dot, which is not an allowed character", () => {
    const result = selectHandleSchema.safeParse({ handle: "cool.name" });

    expect(result.success).toBe(false);
    expect(fieldErrors(result.error!).handle).toContain(
      "Use lowercase letters, numbers, hyphens, and underscores only",
    );
  });

  it("rejects an uppercase-only handle once lowercased leaves invalid chars", () => {
    // After lowercasing, the "@" is still invalid — casing alone never sneaks past.
    const result = selectHandleSchema.safeParse({ handle: "Cool@Name" });

    expect(result.success).toBe(false);
    expect(fieldErrors(result.error!).handle).toContain(
      "Use lowercase letters, numbers, hyphens, and underscores only",
    );
  });

  it("rejects a reserved handle", () => {
    const result = selectHandleSchema.safeParse({ handle: "admin" });

    expect(result.success).toBe(false);
    expect(fieldErrors(result.error!).handle).toContain(
      "That username is reserved",
    );
  });

  it("rejects a reserved handle regardless of casing", () => {
    const result = selectHandleSchema.safeParse({ handle: "Dashboard" });

    expect(result.success).toBe(false);
    expect(fieldErrors(result.error!).handle).toContain(
      "That username is reserved",
    );
  });
});
