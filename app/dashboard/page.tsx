// Placeholder so the post-onboarding redirect resolves. The real dashboard is a
// later feature; this route is protected by the proxy like every authenticated
// route.
export default function DashboardPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center font-sans text-ink">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">
        Dashboard
      </h1>
    </main>
  );
}
