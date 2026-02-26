import { Link } from "react-router-dom";
import { CirclePlay, Sparkles, Star } from "lucide-react";
import { HeroChart } from "./HeroChart";

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-5 pb-16 pt-12 md:flex-row md:items-center md:px-10 md:pb-20 md:pt-20"
    >
      <div className="w-full md:w-[45%]">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs text-[#6B7280]">
          <Sparkles className="h-3.5 w-3.5 text-[#0E9384]" />
          Inteligência para seus investimentos
        </span>

        <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-[-0.02em] text-[#0F0F14] md:text-6xl">
          Monitore sua watchlist.
          <br />
          Tome decisões melhores.
        </h1>

        <p className="mt-6 max-w-[420px] text-base leading-[1.65] text-[#6B7280]">
          Acompanhe indicadores financeiros de empresas B3 com dados da CVM, B3 e RI. Alertas, evidências e contexto,
          tudo em um lugar.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0E9384] px-7 py-3.5 text-[15px] font-semibold text-white transition hover:scale-[1.02] hover:bg-[#0B7F74] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2"
          >
            Começar grátis
          </Link>
          <Link
            to="/demo"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-6 py-3.5 text-[15px] font-medium text-[#111827] transition hover:border-[#D1D5DB] hover:bg-[#F9FAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2"
          >
            Ver demonstração
            <CirclePlay className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <div className="flex -space-x-2">
            {["A", "B", "C", "D"].map((item) => (
              <span
                key={`avatar-${item}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#E5E7EB] text-xs font-semibold text-[#6B7280]"
              >
                {item}
              </span>
            ))}
          </div>

          <div>
            <p className="text-sm font-semibold text-[#0F0F14]">Usado por investidores no Brasil</p>
            <p className="inline-flex items-center gap-1 text-sm text-[#6B7280]">
              <Star className="h-3.5 w-3.5 text-[#D97706]" />
              Feedback contínuo da comunidade
            </p>
          </div>
        </div>
      </div>

      <div className="w-full md:w-[55%]">
        <HeroChart />
      </div>
    </section>
  );
}


