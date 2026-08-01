import { Accordion } from "@/components/ui/accordion";
import type { AccordionItem } from "@/components/ui/accordion";

const FAQ_ITEMS: AccordionItem[] = [
  {
    q: "What is Linkbase?",
    a: "Linkbase is your link in bio — one shareable page that holds all of your other links. Share the single URL anywhere and send people to everything you do.",
  },
  {
    q: "Is Linkbase free?",
    a: "Yes. Every account gets a free page with unlimited links. Paid plans add custom themes, deeper analytics and monetization tools.",
  },
  {
    q: "Do I need a website too?",
    a: "No. Your Linkbase page works as a lightweight site on its own — no separate hosting, domain or code required.",
  },
  {
    q: "Can I sell products from my page?",
    a: "Add a Shop section to sell products and collect payments right from your Linkbase, without sending people anywhere else.",
  },
  {
    q: "Can I customize how it looks?",
    a: "Choose colors, fonts and layouts to match your brand, and connect your own custom domain on paid plans.",
  },
  {
    q: "How do I share my Linkbase?",
    a: "Add your unique linkbase.to/ URL to your social bios, and use your built-in QR code to bring offline audiences online.",
  },
];

// Berry FAQ section with an on-dark, single-open accordion (first item open).
export function Faq() {
  return (
    <section className="bg-berry">
      <div className="mx-auto max-w-[780px] px-[clamp(20px,5vw,32px)] py-[clamp(56px,8vw,90px)]">
        <h2 className="mb-[clamp(28px,4vw,40px)] text-center font-display text-[clamp(30px,5vw,40px)] font-black tracking-tight text-chartreuse">
          Questions? Answered.
        </h2>
        <Accordion items={FAQ_ITEMS} onDark defaultOpen={0} />
      </div>
    </section>
  );
}
