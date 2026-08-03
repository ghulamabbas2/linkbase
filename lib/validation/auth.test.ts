import { describe, expect, it } from "vitest";
import { z } from "zod";

import { signInSchema, signUpSchema } from "./auth";

// Helper mirroring how the Server Actions read field errors (app/(auth)/actions.ts).
function fieldErrors(error: z.ZodError): Record<string, string[] | undefined> {
  return z.flattenError(error).fieldErrors;
}

describe("signInSchema", () => {
  it("accepts a valid email and password", () => {
    const result = signInSchema.safeParse({
      email: "user@example.com",
      password: "anything",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      email: "user@example.com",
      password: "anything",
    });
  });

  it("trims and lowercases the email", () => {
    const result = signInSchema.safeParse({
      email: "  User@Example.COM  ",
      password: "anything",
    });

    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("user@example.com");
  });

  it("rejects a malformed email", () => {
    const result = signInSchema.safeParse({
      email: "not-an-email",
      password: "anything",
    });

    expect(result.success).toBe(false);
    expect(fieldErrors(result.error!).email).toContain(
      "Enter a valid email address",
    );
  });

  it("rejects an empty password", () => {
    const result = signInSchema.safeParse({
      email: "user@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
    expect(fieldErrors(result.error!).password).toContain("Enter your password");
  });
});

describe("signUpSchema", () => {
  it("accepts a valid signup with matching passwords", () => {
    const result = signUpSchema.safeParse({
      email: "new@example.com",
      password: "supersecret",
      confirmPassword: "supersecret",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      email: "new@example.com",
      password: "supersecret",
      confirmPassword: "supersecret",
    });
  });

  it("trims and lowercases the email", () => {
    const result = signUpSchema.safeParse({
      email: "  New@Example.COM  ",
      password: "supersecret",
      confirmPassword: "supersecret",
    });

    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("new@example.com");
  });

  it("rejects a malformed email", () => {
    const result = signUpSchema.safeParse({
      email: "nope",
      password: "supersecret",
      confirmPassword: "supersecret",
    });

    expect(result.success).toBe(false);
    expect(fieldErrors(result.error!).email).toContain(
      "Enter a valid email address",
    );
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = signUpSchema.safeParse({
      email: "new@example.com",
      password: "short",
      confirmPassword: "short",
    });

    expect(result.success).toBe(false);
    expect(fieldErrors(result.error!).password).toContain(
      "Password must be at least 8 characters",
    );
  });

  it("requires confirmPassword to be non-empty", () => {
    const result = signUpSchema.safeParse({
      email: "new@example.com",
      password: "supersecret",
      confirmPassword: "",
    });

    expect(result.success).toBe(false);
    expect(fieldErrors(result.error!).confirmPassword).toContain(
      "Confirm your password",
    );
  });

  it("reports a mismatch on the confirmPassword field", () => {
    const result = signUpSchema.safeParse({
      email: "new@example.com",
      password: "supersecret",
      confirmPassword: "different",
    });

    expect(result.success).toBe(false);
    expect(fieldErrors(result.error!).confirmPassword).toContain(
      "Passwords do not match",
    );
  });
});
