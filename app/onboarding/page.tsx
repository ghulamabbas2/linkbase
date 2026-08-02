import { redirect } from "next/navigation";

import { OnboardingWelcome } from "@/components/onboarding/onboarding-welcome";
import { auth } from "@/lib/auth";

export default async function OnboardingPage() {
  // Belt-and-suspenders with the proxy: an already-onboarded user never sees this.
  const session = await auth();
  if (session?.user?.handle) redirect("/dashboard");

  return <OnboardingWelcome />;
}
