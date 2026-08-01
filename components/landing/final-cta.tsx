import { HandleCtaForm } from "./handle-cta-form";

// Grape final call-to-action.
export function FinalCta() {
  return (
    <section className="bg-grape">
      <div className="mx-auto max-w-[640px] px-[clamp(20px,5vw,32px)] py-[clamp(64px,9vw,100px)] text-center">
        <h2 className="m-0 font-display text-[clamp(34px,5.5vw,46px)] font-black leading-[1.04] tracking-tight text-white">
          Your corner of the internet is waiting.
        </h2>
        <HandleCtaForm
          buttonVariant="green"
          className="mx-auto mt-[clamp(24px,4vw,32px)] text-left"
        />
      </div>
    </section>
  );
}
