export function FeatureMockup({ title }: { title: string }) {
  if (title === "Resumo Inteligente") {
    return (
      <div className="rounded-xl border border-[#F3F4F6] bg-white p-3">
        <p className="text-xs text-[#6B7280]">Resumo do dia</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {["3 críticos", "6 atenção", "14 total"].map((item) => (
            <div key={`summary-${item}`} className="rounded-lg bg-[#F9FAFB] px-2 py-2 text-center text-[11px] font-medium text-[#111827]">
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (title === "Pilares Financeiros") {
    return (
      <div className="rounded-xl border border-[#F3F4F6] bg-white p-3">
        <div className="mx-auto h-24 w-24 rounded-full border border-dashed border-[#0E9384]/40" />
        <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-[#6B7280]">
          {["Dívida", "Caixa", "Margens", "Retorno", "Proventos"].map((item) => (
            <span key={`pillar-${item}`} className="rounded-full bg-[#F3F4F6] px-2 py-0.5">
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (title === "Alertas em Tempo Real") {
    return (
      <div className="rounded-xl border border-[#F3F4F6] bg-white p-3">
        <div className="rounded-xl bg-[linear-gradient(135deg,#0E9384,#34D399)] px-3 py-2 text-white">
          <p className="text-sm font-semibold">PETR4 em atenção</p>
          <p className="text-xs text-white/90">Mudança de margem operacional</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#F3F4F6] bg-white p-3">
      <p className="text-xs text-[#6B7280]">Fontes verificáveis</p>
      <div className="mt-2 space-y-1 text-[11px] text-[#6B7280]">
        {["CVM • Atualizado", "B3 • Atualizado", "RI • Atualizado"].map((row) => (
          <div key={`row-${row}`} className="flex items-center justify-between rounded bg-[#F9FAFB] px-2 py-1">
            <span>{row.split(" • ")[0]}</span>
            <span className="rounded-full bg-[#F0FDFA] px-2 py-0.5 text-[#0E9384]">{row.split(" • ")[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
