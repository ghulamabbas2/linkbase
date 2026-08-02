import Link from "next/link";

import { Wordmark } from "@/components/ui/wordmark";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-gray-100 px-5 py-12 font-sans text-ink">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="Linkbase home">
            <Wordmark className="text-[28px] text-ink" />
          </Link>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-[var(--shadow-card)]">
          {children}
        </div>
      </div>
    </main>
  );
}
