import { redirect } from "next/navigation";

import { SignUpForm } from "@/components/auth/sign-up-form";
import { auth } from "@/lib/auth";

export default async function SignUpPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Start building your Linkbase in seconds
        </p>
      </div>
      <SignUpForm />
    </div>
  );
}
