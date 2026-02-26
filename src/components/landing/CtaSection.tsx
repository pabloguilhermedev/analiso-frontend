import { Link } from "react-router-dom";

export function CtaSection() {
  return (
    <section className="px-5 py-14 md:px-10 md:py-20">
      <div className="mx-auto w-full max-w-[1120px] rounded-3xl bg-[#0E9384] px-6 py-12 text-center text-white md:px-10 md:py-16">
        <div className="bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_70%)]">
          <h2 className="text-3xl font-bold tracking-[-0.01em] md:text-5xl">Pronto para monitorar melhor?</h2>
          <p className="mt-3 text-base text-white/80">Comece gratuitamente. Sem cartão de crédito.</p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-[#0E9384] transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E9384]"
            >
              Começar grátis
            </Link>
            <Link
              to="/demo"
              className="rounded-full border border-white/40 px-6 py-3.5 text-[15px] text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E9384]"
            >
              Ver demonstração
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}


