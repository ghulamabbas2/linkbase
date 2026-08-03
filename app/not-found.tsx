import Link from "next/link";

import { Wordmark } from "@/components/ui/wordmark";

// App-wide fallback for unmatched routes. Rendered by the App Router with a
// 404 status (docs/routing.md).
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-white px-6 text-center">
      <Wordmark className="text-2xl" />
      <div className="flex flex-col gap-1.5">
        <p className="font-display text-5xl font-black tracking-tight text-green">
          404
        </p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">
          This page doesn&apos;t exist
        </h1>
        <p className="font-sans text-base text-gray-500">
          The page you&apos;re looking for couldn&apos;t be found.
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
