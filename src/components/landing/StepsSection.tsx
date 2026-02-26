import { ChartColumn, Sparkles } from "lucide-react";
import type { Step } from "../../data/landing";

interface StepsSectionProps {
  steps: Step[];
}

export function StepsSection({ steps }: StepsSectionProps) {
  return (
    <section className="bg-white px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto w-full max-w-[1200px] text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs text-[#6B7280]">
          <Sparkles className="h-3.5 w-3.5 text-[#0E9384]" />
          Como funciona
        </span>
        <h2 className="mx-auto mt-4 max-w-[760px] text-3xl font-bold tracking-[-0.01em] text-[#0F0F14] md:text-5xl">
          Simples de usar, poderoso na análise.
        </h2>

        <div className="relative mt-14 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-8">
          <div className="absolute left-0 right-0 top-8 hidden border-t border-dashed border-[#E5E7EB] md:block" />
          {steps.map((step) => (
            <article key={`step-${step.id}`} className="relative rounded-2xl border border-[#E8EAED] bg-white p-6 text-left">
              <span className="absolute -top-7 left-4 text-5xl font-bold text-[#0E9384]/15">{step.id}</span>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#0E9384] text-white">
                <ChartColumn className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-lg font-semibold text-[#0F0F14]">{step.title}</h3>
              <p className="mt-2 text-sm leading-[1.6] text-[#6B7280]">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
