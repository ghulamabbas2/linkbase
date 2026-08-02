import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";
import { auth } from "@/lib/auth";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Log in to your Linkbase account
        </p>
      </div>
      <SignInForm />
    </div>
  );
}
