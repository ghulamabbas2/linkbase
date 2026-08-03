import Link from "next/link";

import { Wordmark } from "@/components/ui/wordmark";

// Rendered when `getPublicProfile` returns null for the requested handle
// (docs/routing.md). Served with a 404 status by the App Router.
export default function ProfileNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-white px-6 text-center">
      <Wordmark className="text-2xl" />
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">
          This profile doesn&apos;t exist
        </h1>
        <p className="font-sans text-base text-gray-500">
          The handle you&apos;re looking for isn&apos;t on Linkbase.
        </p>
      </div>
      <Link
        href="/"
        className="font-sans text-base font-bold text-green hover:text-green-ink"
      >
        Back to Linkbase
      </Link>
    </div>
  );
}
