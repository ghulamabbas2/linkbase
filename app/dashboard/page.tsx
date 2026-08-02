import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { auth } from "@/lib/auth";
import { getLinksForUser } from "@/lib/dashboard/links";

// Authenticated dashboard: the signed-in user manages the links on their public
// profile. The proxy already gates access; we read identity + data on the server
// and pass plain DTOs down (docs/data-fetching.md).
export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const handle = session?.user?.handle;

  // Belt-and-suspenders with the proxy: no session or no handle shouldn't reach
  // the real dashboard.
  if (!userId) redirect("/sign-in");
  if (!handle) redirect("/onboarding");

  const links = await getLinksForUser(userId);

  return <DashboardShell handle={handle} links={links} />;
}
