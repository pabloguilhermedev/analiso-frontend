export function HeroChart() {
  return (
    <div className="relative mx-auto mt-10 w-full max-w-[560px] md:mt-0">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(14,147,132,0.12)_0%,rgba(14,147,132,0)_75%)] blur-[60px]" />

      <article className="landing-rise-up relative z-20 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_8px_32px_rgba(0,0,0,0.10)] md:p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[#111827]">Saúde da Watchlist</p>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#D97706]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#0E9384]" />
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-[#6B7280]">
          <span>Indicadores mensais</span>
          <span>Período: 12 meses</span>
        </div>

        <div className="mt-4 flex h-44 items-end gap-2">
          {[24, 28, 22, 32, 36, 40, 30, 35, 38, 44, 34, 42].map((height, idx) => (
            <div key={`chart-bar-${idx}`} className="flex flex-1 flex-col items-center gap-1">
              {idx === 9 ? (
                <span className="rounded-full bg-[#F0FDFA] px-2 py-0.5 text-[10px] font-semibold text-[#0B7F74]">↑ Saudável</span>
              ) : (
                <span className="h-[18px]" />
              )}
              <div
                className={`w-full rounded-md ${idx % 2 === 0 ? "bg-[#0E9384]" : "border border-[#0E9384] bg-[#F0FDFA]"}`}
                style={{ height: `${height * 2.2}px` }}
              />
              <span className="text-[10px] text-[#6B7280]">{["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][idx]}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="landing-rise-up relative -bottom-3 left-3 z-30 w-[74%] rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)] motion-safe:[animation-delay:150ms]">
        <p className="text-xs text-[#6B7280]">Resumo da watchlist</p>
        <p className="mt-1 text-2xl font-bold text-[#0F0F14]">14 empresas</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 flex-1 rounded-full bg-[#E5E7EB]">
            <div className="h-2 w-[60%] rounded-full bg-[#0E9384]" />
          </div>
          <span className="text-xs font-semibold text-[#0E9384]">42% saudáveis</span>
        </div>
      </article>

      <article className="landing-rise-up relative -bottom-9 left-0 z-40 flex w-[220px] items-center gap-2 rounded-full bg-[linear-gradient(135deg,#0E9384,#34D399)] px-3 py-2 text-white shadow-[0_0_30px_rgba(14,147,132,0.3)] motion-safe:[animation-delay:300ms]">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold">V</span>
        <div>
          <p className="text-[13px] font-semibold">VALE3 em atenção</p>
          <p className="text-[11px] text-white/90">Dívida subiu</p>
        </div>
      </article>

      <article className="landing-rise-up absolute -right-3 top-[56%] z-20 w-[250px] rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)] motion-safe:[animation-delay:200ms] md:right-0">
        <div className="flex items-center justify-between text-xs text-[#6B7280]">
          <span>CVM/B3/RI</span>
          <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-semibold text-[#6B7280]">B3</span>
        </div>
        <p className="mt-3 text-xs text-[#6B7280]">Saldo indicadores</p>
        <p className="mt-1 text-xl font-bold text-[#0F0F14]">Dívida Líq./EBITDA 2.3×</p>
        <div className="mt-3 text-xs text-[#6B7280]">
          <p>Número de alertas: ••• 12 ativos</p>
          <p className="mt-1">Atualizado recentemente</p>
        </div>
      </article>
    </div>
  );
}
