import { ChartColumn, Sparkles } from "lucide-react";
import type { Feature } from "../../data/landing";
import { FeatureMockup } from "./FeatureMockup";

interface FeaturesSectionProps {
  features: Feature[];
}

export function FeaturesSection({ features }: FeaturesSectionProps) {
  return (
    <section id="funcionalidades" className="mx-auto w-full max-w-[1200px] px-5 py-16 md:px-10 md:py-24">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs text-[#6B7280]">
          <Sparkles className="h-3.5 w-3.5 text-[#0E9384]" />
          Funcionalidades
        </span>
        <h2 className="mx-auto mt-4 max-w-[760px] text-3xl font-bold tracking-[-0.01em] text-[#0F0F14] md:text-5xl">
          Tudo que você precisa para monitorar melhor
        </h2>
        <p className="mx-auto mt-4 max-w-[560px] text-base leading-[1.6] text-[#6B7280]">
          A plataforma mais completa para acompanhar indicadores financeiros de empresas brasileiras com dados oficiais e contexto inteligente.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
        {features.map((feature) => (
          <article
            key={`feature-${feature.title}`}
            className="rounded-2xl border border-[#E8EAED] bg-white p-7 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] motion-reduce:transform-none"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#CCFBF1] bg-[#F0FDFA] text-[#0E9384]">
                <ChartColumn className="h-4 w-4" />
              </span>
              <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs text-[#6B7280]">{feature.tag}</span>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-[#0F0F14]">{feature.title}</h3>
            <p className="mt-2 text-sm leading-[1.6] text-[#6B7280]">{feature.description}</p>
            <div className="mt-5">
              <FeatureMockup title={feature.title} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
