import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { LandingHero } from "@/components/landing/landing-hero";
import { Reasons } from "@/components/landing/reasons";
import { SiteFooter } from "@/components/landing/site-footer";

export default function Home() {
  return (
    <main className="font-sans text-ink">
      <LandingHero />
      <Reasons />
      <Faq />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}
