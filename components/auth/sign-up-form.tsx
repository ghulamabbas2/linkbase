"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signUp, type AuthActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthActionState = {};

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
        error={state.fieldErrors?.email?.[0]}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.password?.[0]}
        hint="At least 8 characters"
      />
      <Input
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.confirmPassword?.[0]}
      />
      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Creating account…" : "Sign up free"}
      </Button>
      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-ink hover:text-gray-600"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
