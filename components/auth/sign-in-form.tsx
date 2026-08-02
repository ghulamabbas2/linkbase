"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signInWithCredentials, type AuthActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthActionState = {};

export function SignInForm() {
  const [state, formAction, pending] = useActionState(
    signInWithCredentials,
    initialState,
  );

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
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password?.[0]}
      />
      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Logging in…" : "Log in"}
      </Button>
      <p className="text-center text-sm text-gray-500">
        No account?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-ink hover:text-gray-600"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
