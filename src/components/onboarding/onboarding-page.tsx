"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type Market = "BR" | "US";
type Level = "iniciante" | "intermediario" | "avancado";
type Goal = "montar_watchlist" | "entender_empresa" | "acompanhar_mudancas";
type AlertPreference = "importantes" | "tudo" | "desligado";

type OnboardingDraft = {
  market: Market;
  experienceLevel: Level | null;
  goal: Goal | null;
  watchlistTickers: string[];
  alertPreference: AlertPreference;
  onboardingCompleted: boolean;
  notifyUS: boolean;
};

const DRAFT_KEY = "analiso_onboarding_draft";
const COMPLETE_KEY = "analiso_onboarding_completed";

const defaultDraft: OnboardingDraft = {
  market: "BR",
  experienceLevel: null,
  goal: null,
  watchlistTickers: [],
  alertPreference: "importantes",
  onboardingCompleted: false,
  notifyUS: false,
};

const popularTickers = ["WEGE3", "ITUB4", "PETR4", "VALE3", "BBDC4", "BBAS3", "ABEV3"];

const watchlistSuggestions = [
  { name: "WEG S.A.", ticker: "WEGE3", tag: "Popular", icon: "factory" },
  { name: "Itaú Unibanco", ticker: "ITUB4", tag: "Grande", icon: "bank" },
  { name: "Petrobras", ticker: "PETR4", tag: "Popular", icon: "oil" },
  { name: "Vale", ticker: "VALE3", tag: "Grande", icon: "mine" },
  { name: "Bradesco", ticker: "BBDC4", tag: "Grande", icon: "bank" },
  { name: "Banco do Brasil", ticker: "BBAS3", tag: "Popular", icon: "bank" },
  { name: "Ambev", ticker: "ABEV3", tag: "Popular", icon: "factory" },
  { name: "Magalu", ticker: "MGLU3", tag: "Popular", icon: "store" },
  { name: "Localiza", ticker: "RENT3", tag: "Grande", icon: "car" },
  { name: "RaiaDrogasil", ticker: "RADL3", tag: "Popular", icon: "pharmacy" },
];

function track(event: string, props?: Record<string, unknown>) {
  // Placeholder de analytics
  console.log("[analytics]", event, props ?? {});
}

function useLocalDraft() {
  const [draft, setDraft] = useState<OnboardingDraft>(defaultDraft);

  useEffect(() => {
    const stored = localStorage.getItem(DRAFT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<OnboardingDraft>;
        setDraft({ ...defaultDraft, ...parsed });
      } catch {
        setDraft(defaultDraft);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft]);

  return { draft, setDraft };
}

function ProgressBar({ step }: { step: number }) {
  const percent = Math.min(100, Math.max(0, (step / 5) * 100));
  return (
    <div className="w-48 h-1 rounded-full bg-[#E4E7EC] overflow-hidden">
      <div className="h-full bg-[#0E9384] transition-all" style={{ width: `${percent}%` }} />
    </div>
  );
}

function TileGrid({
  items,
  columns = 2,
  selectedId,
  onSelect,
  lockedIds = [],
}: {
  items: Array<{ id: string; title: string; helper?: string; icon: string; badge?: string }>;
  columns?: 1 | 2;
  selectedId: string | null;
  onSelect: (id: string) => void;
  lockedIds?: string[];
}) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const idx = Math.max(0, items.findIndex((item) => item.id === selectedId));
    setFocusedIndex(idx >= 0 ? idx : 0);
  }, [items, selectedId]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const colCount = columns;
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = Math.min(items.length - 1, index + 1);
    if (event.key === "ArrowLeft") nextIndex = Math.max(0, index - 1);
    if (event.key === "ArrowDown") nextIndex = Math.min(items.length - 1, index + colCount);
    if (event.key === "ArrowUp") nextIndex = Math.max(0, index - colCount);

    if (nextIndex !== index) {
      event.preventDefault();
      itemRefs.current[nextIndex]?.focus();
      setFocusedIndex(nextIndex);
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(items[index].id);
    }
  };

  return (
    <div className={`grid grid-cols-1 ${columns === 2 ? "md:grid-cols-2" : ""} gap-4`}>
      {items.map((item, index) => {
        const isSelected = item.id === selectedId;
        const isLocked = lockedIds.includes(item.id);
        return (
          <button
            key={item.id}
            ref={(el) => (itemRefs.current[index] = el)}
            type="button"
            onClick={() => onSelect(item.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            aria-pressed={isSelected}
            aria-disabled={isLocked}
            className={`text-center rounded-2xl border p-4 transition-all shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0E9384]/40 ${
              isSelected ? "border-[#0E9384] bg-[#0E9384]/5" : "border-[#EAECF0] hover:border-[#D0D5DD]"
            } ${isLocked ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-0.5"}`}
          >
            <div className="relative flex items-center justify-center">
              <Icon3D name={item.icon} />
              {item.badge && (
                <span className="absolute -top-2 right-0 text-[10px] text-[#0E9384] bg-[#0E9384]/10 px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
            <p className="mt-3 text-sm font-semibold">{item.title}</p>
            {item.helper && <p className="mt-1 text-xs text-[#475467]">{item.helper}</p>}
          </button>
        );
      })}
    </div>
  );
}

function Icon3D({ name }: { name: string }) {
  const accents: Record<string, JSX.Element> = {
    b3: <rect x="20" y="22" width="24" height="16" rx="3" fill="#0E9384" opacity="0.25" />,
    us: <path d="M22 24h20v12H22z" fill="#0E9384" opacity="0.25" />,
    cap: <path d="M20 28l12-6 12 6-12 6-12-6z" fill="#0E9384" opacity="0.25" />,
    magnifier: (
      <>
        <circle cx="28" cy="30" r="6" fill="#0E9384" opacity="0.25" />
        <rect x="34" y="34" width="10" height="3" rx="1.5" fill="#0E9384" opacity="0.35" />
      </>
    ),
    dash: <rect x="22" y="24" width="20" height="14" rx="2" fill="#0E9384" opacity="0.25" />,
    bookmark: <path d="M24 22h16v20l-8-5-8 5V22z" fill="#0E9384" opacity="0.25" />,
    snowflake: <circle cx="32" cy="32" r="8" fill="#0E9384" opacity="0.25" />,
    bellpulse: (
      <>
        <path d="M24 38h16l-2-3v-5a6 6 0 0 0-12 0v5l-2 3z" fill="#0E9384" opacity="0.25" />
        <circle cx="44" cy="22" r="3" fill="#0E9384" opacity="0.35" />
      </>
    ),
    bellstar: (
      <>
        <path d="M24 38h16l-2-3v-5a6 6 0 0 0-12 0v5l-2 3z" fill="#0E9384" opacity="0.25" />
        <path
          d="M44 20l1.5 3 3 0.4-2.2 2 0.6 3-2.9-1.6-2.9 1.6 0.6-3-2.2-2 3-0.4z"
          fill="#0E9384"
          opacity="0.35"
        />
      </>
    ),
    bell: <path d="M24 38h16l-2-3v-5a6 6 0 0 0-12 0v5l-2 3z" fill="#0E9384" opacity="0.25" />,
    belloff: (
      <>
        <path d="M24 38h16l-2-3v-5a6 6 0 0 0-12 0v5l-2 3z" fill="#0E9384" opacity="0.2" />
        <path d="M22 22l20 20" stroke="#0E9384" strokeWidth="2" opacity="0.4" />
      </>
    ),
    factory: <rect x="20" y="24" width="24" height="16" rx="2" fill="#0E9384" opacity="0.25" />,
    bank: <path d="M20 30h24v10H20z" fill="#0E9384" opacity="0.25" />,
    oil: <ellipse cx="32" cy="34" rx="8" ry="10" fill="#0E9384" opacity="0.25" />,
    mine: <path d="M22 38l10-12 10 12H22z" fill="#0E9384" opacity="0.25" />,
    store: <rect x="20" y="26" width="24" height="14" rx="2" fill="#0E9384" opacity="0.25" />,
    car: <rect x="20" y="30" width="24" height="8" rx="3" fill="#0E9384" opacity="0.25" />,
    pharmacy: <rect x="24" y="26" width="16" height="16" rx="3" fill="#0E9384" opacity="0.25" />,
  };

  return (
    <div className="w-12 h-12 rounded-xl bg-white border border-[#EAECF0] shadow-sm flex items-center justify-center">
      <svg viewBox="0 0 64 64" className="w-8 h-8" aria-hidden="true">
        <path
          d="M32 6l22 12v28L32 58 10 46V18L32 6z"
          fill="#E8F6F4"
          stroke="#0E9384"
          strokeWidth="2"
        />
        <path d="M32 6v52" stroke="#0E9384" strokeWidth="2" strokeOpacity="0.35" />
        {accents[name]}
      </svg>
    </div>
  );
}

function SecondaryButton({
  onClick,
  children,
  disabled,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 rounded-xl border border-[#D0D5DD] text-sm text-[#344054] hover:border-[#98A2B3] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

function PrimaryButton({
  onClick,
  children,
  disabled,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="px-5 py-2.5 rounded-xl bg-[#0E9384] text-white text-sm font-semibold hover:bg-[#0B7F74] disabled:bg-[#D0D5DD] disabled:text-[#98A2B3] disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-black/20" onClick={onClose} aria-label="Fechar" />
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#EAECF0] shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[#0B1220]">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-[#EAECF0] flex items-center justify-center hover:border-[#D0D5DD]"
            >
              ✕
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const { draft, setDraft } = useLocalDraft();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [showUsTooltip, setShowUsTooltip] = useState(false);
  const [showPillarsModal, setShowPillarsModal] = useState(false);

  const filteredSuggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return watchlistSuggestions;
    return watchlistSuggestions.filter(
      (item) => item.name.toLowerCase().includes(q) || item.ticker.toLowerCase().includes(q),
    );
  }, [search]);

  useEffect(() => {
    track("onboarding_start");
  }, []);

  useEffect(() => {
    track("onboarding_step_view", { step });
  }, [step]);

  useEffect(() => {
    const completed = localStorage.getItem(COMPLETE_KEY) === "true";
    if (completed) {
      navigate("/dashboard");
    }
  }, [navigate]);

  useEffect(() => {
    const nextStep =
      draft.experienceLevel === null
        ? 2
        : draft.goal === null
          ? 3
          : draft.watchlistTickers.length >= 3
            ? 5
            : 4;
    setStep((prev) => (prev === 1 ? nextStep : prev));
  }, [draft.experienceLevel, draft.goal, draft.watchlistTickers.length]);

  const updateDraft = (partial: Partial<OnboardingDraft>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  };

  const goNext = () => {
    track("onboarding_step_complete", { step });
    if (step === 3 && draft.watchlistTickers.length >= 3) {
      setStep(5);
      return;
    }
    setStep((prev) => Math.min(5, prev + 1));
  };

  const goBack = () => setStep((prev) => Math.max(1, prev - 1));

  const addTicker = (ticker: string, source: "search" | "chip" | "grid") => {
    if (draft.watchlistTickers.includes(ticker) || draft.watchlistTickers.length >= 10) return;
    const next = [...draft.watchlistTickers, ticker];
    updateDraft({ watchlistTickers: next });
    track("watchlist_add", { ticker, source });
  };

  const removeTicker = (ticker: string) => {
    updateDraft({ watchlistTickers: draft.watchlistTickers.filter((item) => item !== ticker) });
  };

  const handleComplete = () => {
    track("onboarding_complete", {
      market: draft.market,
      level: draft.experienceLevel,
      goal: draft.goal,
      watchlistCount: draft.watchlistTickers.length,
      alertPreference: draft.alertPreference,
    });
    updateDraft({ onboardingCompleted: true });
    localStorage.setItem(COMPLETE_KEY, "true");
    sessionStorage.setItem("onboarding_toast", "Tudo pronto. Sua watchlist já está montada.");
    navigate("/dashboard");
  };

  const canContinue = () => {
    if (step === 1) return true;
    if (step === 2) return draft.experienceLevel !== null;
    if (step === 3) return draft.goal !== null;
    if (step === 4) return draft.watchlistTickers.length >= 3;
    if (step === 5) return draft.alertPreference !== null;
    return false;
  };

  const renderContent = () => {
    if (step === 1) {
      return (
        <>
          <TileGrid
            items={[
              { id: "BR", title: "Brasil (B3)", icon: "b3" },
              { id: "US", title: "EUA (Nasdaq/NYSE)", icon: "us", badge: "Em breve" },
            ]}
            selectedId={draft.market}
            onSelect={(id) => {
              if (id === "US") {
                setShowUsTooltip(true);
                return;
              }
              updateDraft({ market: "BR" });
              setShowUsTooltip(false);
            }}
            lockedIds={["US"]}
          />
          {showUsTooltip && (
            <div className="mt-4 text-xs text-[#475467] bg-white border border-[#EAECF0] rounded-xl p-3">
              Estamos finalizando esse mercado. Quer ser avisado?
              <label className="ml-3 inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={draft.notifyUS}
                  onChange={(event) => updateDraft({ notifyUS: event.target.checked })}
                />
                Avisar-me
              </label>
            </div>
          )}
        </>
      );
    }
    if (step === 2) {
      return (
        <TileGrid
          columns={2}
          items={[
            { id: "iniciante", title: "Iniciante", helper: "Quero entender o básico sem ruído.", icon: "cap" },
            {
              id: "intermediario",
              title: "Intermediário",
              helper: "Já olho indicadores e quero contexto.",
              icon: "magnifier",
            },
            { id: "avancado", title: "Avançado", helper: "Quero ir direto ao ponto e comparar.", icon: "dash" },
          ]}
          selectedId={draft.experienceLevel}
          onSelect={(id) => updateDraft({ experienceLevel: id as Level })}
        />
      );
    }
    if (step === 3) {
      return (
        <TileGrid
          columns={2}
          items={[
            {
              id: "montar_watchlist",
              title: "Montar minha watchlist",
              helper: "Escolher empresas e acompanhar mudanças.",
              icon: "bookmark",
            },
            {
              id: "entender_empresa",
              title: "Entender uma empresa",
              helper: "Ver diagnóstico em 60s e evidências.",
              icon: "snowflake",
            },
            {
              id: "acompanhar_mudancas",
              title: "Acompanhar mudanças",
              helper: "Ver o que mudou e por que importa.",
              icon: "bellpulse",
            },
          ]}
          selectedId={draft.goal}
          onSelect={(id) => updateDraft({ goal: id as Goal })}
        />
      );
    }
    if (step === 4) {
      return (
        <div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                const q = search.trim();
                if (!q) return;
                const match = watchlistSuggestions.find(
                  (item) => item.ticker.toLowerCase() === q.toLowerCase(),
                );
                const ticker = match?.ticker ?? q.toUpperCase();
                addTicker(ticker, "search");
                setSearch("");
              }
            }}
            placeholder="Buscar por nome ou ticker (ex: WEGE3)"
            className="w-full rounded-xl border border-[#D0D5DD] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9384]/30"
          />

          <div className="mt-4">
            <p className="text-xs text-[#667085] mb-2">Sugestões populares</p>
            <div className="flex flex-wrap gap-2">
              {popularTickers.map((ticker) => (
                <button
                  key={ticker}
                  type="button"
                  onClick={() => addTicker(ticker, "chip")}
                  className="px-3 py-1 rounded-full border border-[#EAECF0] text-xs text-[#475467] hover:border-[#D0D5DD]"
                >
                  {ticker}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs text-[#667085] mb-2">
              Selecionadas ({draft.watchlistTickers.length}/3)
            </p>
            <div className="flex flex-wrap gap-2">
              {draft.watchlistTickers.map((ticker) => (
                <button
                  key={ticker}
                  type="button"
                  onClick={() => removeTicker(ticker)}
                  className="px-3 py-1 rounded-full border border-[#0E9384]/30 text-xs text-[#0E9384] hover:border-[#0E9384] flex items-center gap-2"
                >
                  {ticker}
                  <span className="text-[10px]">×</span>
                </button>
              ))}
            </div>
            {draft.watchlistTickers.length >= 3 && (
              <p className="mt-2 text-xs text-[#475467]">
                Você já garantiu seu início (3). Pode adicionar mais agora ou depois.
              </p>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSuggestions.map((item) => (
              <button
                key={item.ticker}
                type="button"
                onClick={() => addTicker(item.ticker, "grid")}
                className={`text-left rounded-2xl border p-4 transition-all shadow-sm bg-white hover:border-[#D0D5DD] ${
                  draft.watchlistTickers.includes(item.ticker)
                    ? "border-[#0E9384] bg-[#0E9384]/5"
                    : "border-[#EAECF0]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <Icon3D name={item.icon} />
                  {item.tag && (
                    <span className="text-[10px] text-[#667085] border border-[#EAECF0] rounded-full px-2 py-0.5">
                      {item.tag}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm font-semibold">
                  {item.name} ({item.ticker})
                </p>
              </button>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div>
        <TileGrid
          columns={2}
          items={[
            {
              id: "importantes",
              title: "Só importantes",
              helper: "Mudanças relevantes por pilar.",
              icon: "bellstar",
            },
            { id: "tudo", title: "Tudo", helper: "Atualizações sempre que houver mudança.", icon: "bell" },
            { id: "desligado", title: "Desligado", helper: "Sem alertas por enquanto.", icon: "belloff" },
          ]}
          selectedId={draft.alertPreference}
          onSelect={(id) => updateDraft({ alertPreference: id as AlertPreference })}
        />
        <div className="mt-6 rounded-2xl border border-[#EAECF0] bg-[#F7F8FA] p-4 text-xs text-[#475467]">
          <p className="font-medium text-[#0B1220] mb-2">Transparência</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Sem recomendação de compra ou venda.</li>
            <li>Fontes oficiais (CVM/B3/RI) com data e rastreabilidade.</li>
          </ul>
        </div>
      </div>
    );
  };

  const titles = [
    "Por onde você quer começar?",
    "Qual é seu nível hoje?",
    "O que você quer fazer primeiro?",
    "Escolha 3 empresas para começar",
    "Como você quer ser avisado?",
  ];

  const subtitles = [
    "Você pode mudar depois. Comece pelo mercado que faz mais sentido agora.",
    "Isso ajusta a linguagem e as dicas.",
    "A gente monta o produto ao seu redor.",
    "Com isso, seu Dashboard já nasce útil. Você pode adicionar mais depois.",
    "Sem ruído. Você controla o que entra.",
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0B1220]">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <ProgressBar step={step} />
          <div className="flex-1 text-center">
            <div className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0E9384]/10 border border-[#0E9384]/30 flex items-center justify-center text-sm font-semibold text-[#0E9384]">
                A
              </div>
              <span className="text-sm font-semibold tracking-wide">Analiso</span>
            </div>
          </div>
          <div className="w-48" />
        </div>

        <div className="mt-10 flex justify-center">
          <div className="w-full max-w-[720px] bg-white border border-[#EAECF0] rounded-3xl shadow-sm p-6 md:p-8">
            <div className="text-center">
              <p className="text-xs text-[#667085]">Etapa {step} de 5</p>
              <h1 className="mt-2 text-2xl md:text-3xl font-semibold">{titles[step - 1]}</h1>
              <p className="mt-2 text-sm text-[#475467]">{subtitles[step - 1]}</p>
            </div>

            <div className="mt-8">{renderContent()}</div>

            <div className="mt-8 flex items-center justify-between">
              <SecondaryButton onClick={goBack} disabled={step === 1}>
                ← Voltar
              </SecondaryButton>
              {step < 5 ? (
                <PrimaryButton onClick={goNext} disabled={!canContinue()}>
                  Continuar →
                </PrimaryButton>
              ) : (
                <PrimaryButton onClick={handleComplete} disabled={!canContinue()}>
                  Ir para o Dashboard
                </PrimaryButton>
              )}
            </div>

            {step === 5 && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowPillarsModal(true)}
                  className="text-xs text-[#0E9384] hover:text-[#0B1220]"
                >
                  Ver como calculamos os 5 pilares
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={showPillarsModal}
        onClose={() => setShowPillarsModal(false)}
        title="Como calculamos os 5 pilares"
      >
        <div className="text-sm text-[#475467] space-y-3">
          <p>Os 5 pilares são: Dívida, Caixa, Margens, Retorno e Proventos.</p>
          <p>
            Cada pilar usa indicadores oficiais e mostra o documento e a data de origem para total
            transparência.
          </p>
          <p>Sem recomendação de compra ou venda.</p>
        </div>
      </Modal>
    </div>
  );
}

export default OnboardingPage;
