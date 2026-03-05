"use client";

import { type ReactNode, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CircleHelp,
  ChevronDown,
  ChevronRight,
  Dot,
  ExternalLink,
  FileText,
  Filter,
  Info,
  LineChart as LineIcon,
  ListFilter,
  Moon,
  Search,
  SlidersHorizontal,
  Star,
  UserCircle2,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GlossaryText } from "./glossary/glossary-text";

import { AppSidebar } from "./dashboard";
import { MiniSparkline } from "./mini-sparkline";
import logoCogna from "../assets/logos/cogna.png";
import logoCosan from "../assets/logos/cosan.png";
import logoEztec from "../assets/logos/eztec.jpg";
import logoFleury from "../assets/logos/fleury.png";
import logoIrb from "../assets/logos/irbbrasil.png";
import logoItau from "../assets/logos/itau.png";
import logoMrv from "../assets/logos/mrv.jpg";
import logoPetrobras from "../assets/logos/petrobras.webp";
import logoRenner from "../assets/logos/renner.png";
import logoRumo from "../assets/logos/rumo.png";
import logoTaesa from "../assets/logos/taesa.png";
import logoVale from "../assets/logos/vale.png";
import logoWeg from "../assets/logos/weg.jpeg";

type IndexCard = {
  name: string;
  symbol: string;
  value: string;
  changeAbs: string;
  changePct: string;
  trend: "up" | "down" | "neutral";
  sparkline: number[];
};

type MoverRow = {
  ticker: string;
  name: string;
  price: string;
  changePct: string;
  note: string;
  updatedAt: string;
  source: string;
  type: "altas" | "baixas" | "negociadas";
};

type Volatility = {
  value: number;
  label: "Baixa" | "Moderada" | "Alta";
  updatedAt: string;
  source: string;
};

type HighlightPreset = {
  pillar: "divida" | "caixa" | "margens" | "retorno" | "proventos";
  signal: string;
  severity: "leve" | "moderada" | "forte";
  timeframe: "7d" | "30d" | "90d" | "2q" | "12m";
  scope: "mercado" | "setor" | "watchlist";
};

type HighlightItem = {
  id: string;
  companyName: string;
  ticker: string;
  changeTitle: string;
  whyItMatters: string;
  pillar: "Dívida" | "Caixa" | "Margens" | "Retorno" | "Proventos";
  severity: "Leve" | "Moderada" | "Forte";
  timeframeLabel: string;
  scope: "Mercado" | "Setor" | "Minha watchlist";
  source: {
    name: string;
    updatedAt: string;
    docLabel: string;
    url?: string;
  };
  filterPreset: HighlightPreset;
};

type CompanyCard = {
  name: string;
  ticker: string;
  sector: string;
  size: "Grande" | "Média" | "Pequena";
  status: "Saudável" | "Atenção" | "Risco";
  pillarsScores: number[];
  shortDiagnosis: string;
  freshnessStatus: "Atualizado" | "Antigo";
  updatedAt: string;
  source: string;
  highlightPillar: "Dívida" | "Caixa" | "Margens" | "Retorno" | "Proventos";
};

type FilterKey = "sector" | "size" | "status" | "freshness" | "pillar";
type Filters = Record<FilterKey, string> & { sort: string };
type ExploreTab = "mercado" | "encontrar" | "colecoes";

const indexCards: IndexCard[] = [
  {
    name: "Ibovespa",
    symbol: "IBOV",
    value: "127.540",
    changeAbs: "+680",
    changePct: "+0,54%",
    trend: "up",
    sparkline: [120, 122, 121, 124, 126, 127, 126, 128, 127, 129],
  },
  {
    name: "IBrX 100",
    symbol: "IBRX",
    value: "54.280",
    changeAbs: "-120",
    changePct: "-0,22%",
    trend: "down",
    sparkline: [55, 54.6, 54.4, 54.2, 54.3, 54.1, 54, 54.2, 54.1, 54],
  },
  {
    name: "Small Caps",
    symbol: "SMLL",
    value: "2.145",
    changeAbs: "+6",
    changePct: "+0,28%",
    trend: "up",
    sparkline: [2.05, 2.06, 2.08, 2.07, 2.09, 2.1, 2.12, 2.11, 2.13, 2.145],
  },
  {
    name: "IFIX",
    symbol: "IFIX",
    value: "3.267",
    changeAbs: "+2",
    changePct: "+0,06%",
    trend: "neutral",
    sparkline: [3.24, 3.25, 3.26, 3.25, 3.26, 3.27, 3.265, 3.268, 3.266, 3.267],
  },
  {
    name: "Volatilidade",
    symbol: "IVBX2",
    value: "18,4",
    changeAbs: "-0,3",
    changePct: "-1,6%",
    trend: "down",
    sparkline: [19, 18.8, 18.6, 18.9, 18.5, 18.4, 18.7, 18.3, 18.5, 18.4],
  },
];

const movers: MoverRow[] = [
  {
    ticker: "EZTC3",
    name: "EZTEC",
    price: "R$ 17,80",
    changePct: "+3,4%",
    note: "Volume acima da média semanal.",
    updatedAt: "05/02",
    source: "B3",
    type: "altas",
  },
  {
    ticker: "LREN3",
    name: "Lojas Renner",
    price: "R$ 15,12",
    changePct: "+2,6%",
    note: "Reação após resultado trimestral.",
    updatedAt: "05/02",
    source: "B3",
    type: "altas",
  },
  {
    ticker: "RAIL3",
    name: "Rumo",
    price: "R$ 18,42",
    changePct: "+2,1%",
    note: "Fluxo comprador consistente.",
    updatedAt: "05/02",
    source: "B3",
    type: "altas",
  },
  {
    ticker: "COGN3",
    name: "Cogna",
    price: "R$ 2,84",
    changePct: "-3,8%",
    note: "Correção após alta recente.",
    updatedAt: "05/02",
    source: "B3",
    type: "baixas",
  },
  {
    ticker: "IRBR3",
    name: "IRB Brasil",
    price: "R$ 46,20",
    changePct: "-2,9%",
    note: "Oscilação elevada no intradia.",
    updatedAt: "05/02",
    source: "B3",
    type: "baixas",
  },
  {
    ticker: "PETR4",
    name: "Petrobras",
    price: "R$ 41,30",
    changePct: "+0,4%",
    note: "Maior volume negociado do dia.",
    updatedAt: "05/02",
    source: "B3",
    type: "negociadas",
  },
  {
    ticker: "ITUB4",
    name: "Itaú Unibanco",
    price: "R$ 33,15",
    changePct: "+0,1%",
    note: "Fluxo estável em bancos.",
    updatedAt: "05/02",
    source: "B3",
    type: "negociadas",
  },
  {
    ticker: "VALE3",
    name: "Vale",
    price: "R$ 63,90",
    changePct: "-0,2%",
    note: "Negociação consistente no dia.",
    updatedAt: "05/02",
    source: "B3",
    type: "negociadas",
  },
];

const volatility: Volatility = {
  value: 64,
  label: "Moderada",
  updatedAt: "05/02",
  source: "B3",
};

const highlights: HighlightItem[] = [
  {
    id: "margens-wege3",
    companyName: "WEG",
    ticker: "WEGE3",
    changeTitle: "Margens pressionadas recentemente",
    whyItMatters: "Pode reduzir lucro mesmo com receita estável.",
    pillar: "Margens",
    severity: "Moderada",
    timeframeLabel: "últimos 2 trimestres",
    scope: "Mercado",
    source: {
      name: "CVM",
      updatedAt: "04/02",
      docLabel: "Formulário de Referência",
      url: "https://www.gov.br/cvm",
    },
    filterPreset: {
      pillar: "margens",
      signal: "margem_caindo",
      severity: "moderada",
      timeframe: "2q",
      scope: "mercado",
    },
  },
  {
    id: "proventos-itub4",
    companyName: "Itaú Unibanco",
    ticker: "ITUB4",
    changeTitle: "Proventos mais consistentes",
    whyItMatters: "Melhora previsibilidade de caixa e retorno ao acionista.",
    pillar: "Proventos",
    severity: "Leve",
    timeframeLabel: "últimos 12 meses",
    scope: "Mercado",
    source: {
      name: "RI",
      updatedAt: "05/02",
      docLabel: "Comunicado ao Mercado",
      url: "https://www.itau.com.br/relacoes-com-investidores",
    },
    filterPreset: {
      pillar: "proventos",
      signal: "payout_subindo",
      severity: "leve",
      timeframe: "12m",
      scope: "mercado",
    },
  },
  {
    id: "divida-petr4",
    companyName: "Petrobras",
    ticker: "PETR4",
    changeTitle: "Dívida líquida aumentou",
    whyItMatters: "Aumenta pressão no caixa e pode limitar investimento.",
    pillar: "Dívida",
    severity: "Forte",
    timeframeLabel: "últimos 90 dias",
    scope: "Mercado",
    source: {
      name: "B3",
      updatedAt: "05/02",
      docLabel: "Fato Relevante",
      url: "https://www.b3.com.br",
    },
    filterPreset: {
      pillar: "divida",
      signal: "divida_subindo",
      severity: "forte",
      timeframe: "90d",
      scope: "mercado",
    },
  },
];

const thesisCollections = [
  "Dívida sob controle",
  "Caixa forte",
  "Margens melhorando",
  "Retorno consistente",
  "Proventos estáveis",
  "Dados atualizados",
];

const sectorCollections = ["Bancos", "Energia", "Consumo", "Saúde", "Indústria", "Construção"];

const companies: CompanyCard[] = [
  {
    name: "WEG",
    ticker: "WEGE3",
    sector: "Indústria",
    size: "Grande",
    status: "Saudável",
    pillarsScores: [82, 78, 74, 80, 62],
    shortDiagnosis: "Consistência operacional com margens sólidas.",
    freshnessStatus: "Atualizado",
    updatedAt: "05/02",
    source: "CVM/B3/RI",
    highlightPillar: "Margens",
  },
  {
    name: "Itaú Unibanco",
    ticker: "ITUB4",
    sector: "Bancos",
    size: "Grande",
    status: "Saudável",
    pillarsScores: [70, 76, 68, 74, 72],
    shortDiagnosis: "Retorno estável e caixa resiliente.",
    freshnessStatus: "Atualizado",
    updatedAt: "05/02",
    source: "CVM/B3/RI",
    highlightPillar: "Retorno",
  },
  {
    name: "Taesa",
    ticker: "TAEE11",
    sector: "Energia",
    size: "Média",
    status: "Atenção",
    pillarsScores: [56, 64, 52, 60, 78],
    shortDiagnosis: "Proventos consistentes, mas dívida em atenção.",
    freshnessStatus: "Atualizado",
    updatedAt: "05/02",
    source: "CVM/B3/RI",
    highlightPillar: "Proventos",
  },
  {
    name: "Cosan",
    ticker: "CSAN3",
    sector: "Consumo",
    size: "Média",
    status: "Atenção",
    pillarsScores: [44, 58, 41, 52, 48],
    shortDiagnosis: "Oscilações recentes em alavancagem.",
    freshnessStatus: "Antigo",
    updatedAt: "22/01",
    source: "CVM/B3/RI",
    highlightPillar: "Dívida",
  },
  {
    name: "Fleury",
    ticker: "FLRY3",
    sector: "Saúde",
    size: "Média",
    status: "Saudável",
    pillarsScores: [68, 72, 66, 70, 54],
    shortDiagnosis: "Margens e retorno dentro do esperado.",
    freshnessStatus: "Atualizado",
    updatedAt: "04/02",
    source: "CVM/B3/RI",
    highlightPillar: "Margens",
  },
  {
    name: "MRV",
    ticker: "MRVE3",
    sector: "Construção",
    size: "Média",
    status: "Risco",
    pillarsScores: [30, 42, 28, 34, 36],
    shortDiagnosis: "Alavancagem elevada e retorno pressionado.",
    freshnessStatus: "Antigo",
    updatedAt: "18/01",
    source: "CVM/B3/RI",
    highlightPillar: "Dívida",
  },
];

const pillars = ["Dívida", "Caixa", "Margens", "Retorno", "Proventos"] as const;

const statusColors: Record<CompanyCard["status"], string> = {
  Saudável: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Atenção: "bg-amber-50 text-amber-700 border-amber-100",
  Risco: "bg-rose-50 text-rose-700 border-rose-100",
};

const freshnessColors: Record<CompanyCard["freshnessStatus"], string> = {
  Atualizado: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Antigo: "bg-amber-50 text-amber-700 border-amber-100",
};

const severityStyles: Record<HighlightItem["severity"], string> = {
  Leve: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Moderada: "bg-amber-50 text-amber-700 border-amber-100",
  Forte: "bg-amber-100 text-amber-800 border-amber-200",
};

const pillarLabelMap: Record<HighlightPreset["pillar"], CompanyCard["highlightPillar"]> = {
  divida: "Dívida",
  caixa: "Caixa",
  margens: "Margens",
  retorno: "Retorno",
  proventos: "Proventos",
};

const presetChipLabels = (preset: HighlightPreset) => {
  const severityLabel =
    preset.severity === "leve" ? "Leve" : preset.severity === "moderada" ? "Moderada" : "Forte";
  const timeframeLabelMap: Record<HighlightPreset["timeframe"], string> = {
    "7d": "últimos 7 dias",
    "30d": "últimos 30 dias",
    "90d": "últimos 90 dias",
    "2q": "últimos 2 trimestres",
    "12m": "últimos 12 meses",
  };
  return [pillarLabelMap[preset.pillar], severityLabel, timeframeLabelMap[preset.timeframe]];
};

const getTrendColor = (trend: IndexCard["trend"]) => {
  if (trend === "up") return "text-emerald-600";
  if (trend === "down") return "text-rose-600";
  return "text-neutral-500";
};

const getTrendStatus = (trend: IndexCard["trend"]) => {
  if (trend === "up") return "healthy";
  if (trend === "down") return "risk";
  return "attention";
};

const companyLogos: Record<string, string> = {
  COGN3: logoCogna,
  CSAN3: logoCosan,
  EZTC3: logoEztec,
  FLRY3: logoFleury,
  IRBR3: logoIrb,
  ITUB4: logoItau,
  LREN3: logoRenner,
  MRVE3: logoMrv,
  PETR4: logoPetrobras,
  RAIL3: logoRumo,
  TAEE11: logoTaesa,
  VALE3: logoVale,
  WEGE3: logoWeg,
};

const getCompanyLogo = (ticker: string) => companyLogos[ticker];

function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-20">
      <button className="absolute inset-0 bg-black/20" onClick={onClose} aria-label="Fechar" />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute inset-0 bg-white p-6 md:inset-y-0 md:right-0 md:left-auto md:w-[420px] md:shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-base font-semibold text-[#0B1220]">{title}</h4>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#EAECF0] flex items-center justify-center hover:border-[#D0D5DD]"
          >
            <X className="w-4 h-4 text-[#475467]" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ExplorePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState<MoverRow["type"]>("altas");
  const [selectedEntryPoints, setSelectedEntryPoints] = useState<string[]>([]);
  const [compareTickers, setCompareTickers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [summaryScope, setSummaryScope] = useState<"Mercado" | "Setor" | "Minha watchlist">("Mercado");
  const [summaryState, setSummaryState] = useState<"loading" | "ready" | "empty" | "error">("ready");
  const [activePreset, setActivePreset] = useState<HighlightPreset | null>(null);
  const [appliedChips, setAppliedChips] = useState<string[]>([]);
  const [selectedSource, setSelectedSource] = useState<HighlightItem | null>(null);
  const [showAllHighlights, setShowAllHighlights] = useState(false);
  const [showVolatilityInfo, setShowVolatilityInfo] = useState(false);
  const [showVolatilityDetails, setShowVolatilityDetails] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    sector: "Todos",
    size: "Todos",
    status: "Todos",
    freshness: "Todos",
    pillar: "Todos",
    sort: "Mais atualizadas",
  });

  const isLoading = false; // pronto para ligar quando vier API

  const filteredCompanies = useMemo(() => {
    return companies
      .filter((company) => {
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          if (!company.name.toLowerCase().includes(query) && !company.ticker.toLowerCase().includes(query)) {
            return false;
          }
        }

        if (activePreset) {
          const pillarMatch = company.highlightPillar === pillarLabelMap[activePreset.pillar];
          if (!pillarMatch) return false;
          if (activePreset.severity === "forte" && company.status !== "Risco") return false;
          if (activePreset.severity === "moderada" && company.status === "Saudável") return false;
        }

        if (filters.sector !== "Todos" && company.sector !== filters.sector) return false;
        if (filters.size !== "Todos" && company.size !== filters.size) return false;
        if (filters.status !== "Todos" && company.status !== filters.status) return false;
        if (filters.freshness !== "Todos" && company.freshnessStatus !== filters.freshness) return false;
        if (filters.pillar !== "Todos" && company.highlightPillar !== filters.pillar) return false;

        return true;
      })
      .sort((a, b) => {
        if (filters.sort === "Mais relevantes para este destaque") {
          if (a.status === "Risco" && b.status !== "Risco") return -1;
          if (b.status === "Risco" && a.status !== "Risco") return 1;
          return a.updatedAt < b.updatedAt ? 1 : -1;
        }
        if (filters.sort === "Mais atualizadas") return a.updatedAt < b.updatedAt ? 1 : -1;
        if (filters.sort === "Mudanças recentes") return a.status === "Risco" ? -1 : 1;
        if (filters.sort === "Maior consistência") return a.status === "Saudável" ? -1 : 1;
        return 0;
      });
  }, [filters, searchQuery, activePreset]);

  const staleCount = filteredCompanies.filter((company) => company.freshnessStatus === "Antigo").length;
  const showStaleBanner = staleCount >= 2;
  const hasSectorSelected = filters.sector !== "Todos";
  const hasWatchlist = false;
  const volatilityIsStale = false;

  const toggleEntryPoint = (entry: string) => {
    setSelectedEntryPoints((prev) => (prev.includes(entry) ? prev.filter((item) => item !== entry) : [...prev, entry]));

    if (entry.startsWith("Setor: ")) setFilters((prev) => ({ ...prev, sector: entry.replace("Setor: ", "") }));
    if (entry === "Dados atualizados") setFilters((prev) => ({ ...prev, freshness: "Atualizado" }));
  };

  const clearEntryPoints = () => {
    setSelectedEntryPoints([]);
    setFilters((prev) => ({ ...prev, sector: "Todos", freshness: "Todos" }));
  };

  const applyHighlightPreset = (preset: HighlightPreset) => {
    setActivePreset(preset);
    setAppliedChips(presetChipLabels(preset));
    setSummaryScope(preset.scope === "mercado" ? "Mercado" : preset.scope === "setor" ? "Setor" : "Minha watchlist");
    setFilters((prev) => ({
      ...prev,
      sort: "Mais relevantes para este destaque",
      pillar: pillarLabelMap[preset.pillar],
    }));
  };

  const clearPreset = () => {
    setActivePreset(null);
    setAppliedChips([]);
    setFilters((prev) => ({ ...prev, sort: "Mais atualizadas", pillar: "Todos" }));
  };

  const toggleCompare = (ticker: string) => {
    setCompareTickers((prev) => {
      if (prev.includes(ticker)) return prev.filter((item) => item !== ticker);
      if (prev.length >= 4) return prev;
      return [...prev, ticker];
    });
  };

  const resetFilters = () => {
    setSearchQuery("");
    setActivePreset(null);
    setAppliedChips([]);
    setSelectedEntryPoints([]);
    setFilters({
      sector: "Todos",
      size: "Todos",
      status: "Todos",
      freshness: "Todos",
      pillar: "Todos",
      sort: "Mais atualizadas",
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <div className="fixed inset-y-0 left-0 z-30 w-[240px]">
        <AppSidebar currentPath={location.pathname} onNavigate={navigate} />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-[240px] right-0 z-10 h-12 border-b border-[#E5E7EB] bg-white">
        <div className="flex h-full items-center justify-between gap-2 px-3 sm:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="hidden h-9 w-full max-w-[480px] items-center rounded-lg border border-[#E5E7EB] bg-white px-3 sm:flex">
              <Search className="h-3.5 w-3.5 text-[#A1A1AA]" />
              <input
                type="text"
                placeholder="Buscar empresa ou ticker"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-full border-0 bg-transparent px-2 text-[14px] text-neutral-900 placeholder:text-[#A1A1AA] outline-none"
              />
              <span className="rounded bg-[#F3F4F6] px-1.5 py-0.5 text-[11px] text-[#71717A]">⌘K</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button className="relative grid h-8 w-8 place-items-center rounded-full hover:bg-neutral-50">
              <Bell className="h-[18px] w-[18px] text-[#71717A]" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
            </button>
            <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-neutral-50">
              <Moon className="h-[18px] w-[18px] text-[#71717A]" />
            </button>
            <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-neutral-50">
              <CircleHelp className="h-[18px] w-[18px] text-[#71717A]" />
            </button>
            <button className="grid h-8 w-8 place-items-center rounded-full border border-[#E5E7EB] hover:bg-neutral-50">
              <UserCircle2 className="h-[18px] w-[18px] text-[#71717A]" />
            </button>
          </div>
        </div>
      </header>

      <main className="ml-[240px] pt-12">
        <div className="flex items-start">
          <div className="flex-1 p-8 pr-0">
            <div className="max-w-[1200px] space-y-8">
              {/* Panorama do mercado */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">Panorama do mercado</h2>
                    <p className="text-sm text-neutral-500">Visão rápida dos principais índices da B3.</p>
                  </div>
                  <button className="hidden sm:flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900">
                    <LineIcon className="w-4 h-4" />
                    Ver histórico
                  </button>
                </div>

                {isLoading ? (
                  <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div key={item} className="min-w-[220px] bg-white rounded-2xl border border-neutral-100 shadow-sm p-4">
                        <div className="h-3 w-24 bg-neutral-100 rounded mb-2" />
                        <div className="h-4 w-16 bg-neutral-100 rounded mb-4" />
                        <div className="h-6 w-20 bg-neutral-100 rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible">
                    {indexCards.map((card) => (
                      <div
                        key={card.symbol}
                        className="min-w-[220px] bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md hover:border-neutral-200 transition-all p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-xs text-neutral-500">{card.name}</p>
                            <p className="text-sm font-semibold text-neutral-900">{card.symbol}</p>
                          </div>
                          <MiniSparkline data={card.sparkline} status={getTrendStatus(card.trend)} />
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-lg font-semibold text-neutral-900">{card.value}</p>
                            <div className={`text-xs font-medium ${getTrendColor(card.trend)}`}>
                              {card.changeAbs} ({card.changePct})
                            </div>
                          </div>
                          <span className="text-[10px] text-neutral-400">1D</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Movimentos + Volatilidade */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Movers */}
                <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-neutral-900">Maiores movimentos hoje</h3>
                      <p className="text-xs text-neutral-500">Comparativo intradia sem recomendação.</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <Dot className="w-4 h-4 text-emerald-400" />
                      Mercado à vista
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {[
                      { label: "Altas", value: "altas" },
                      { label: "Baixas", value: "baixas" },
                      { label: "Mais negociadas", value: "negociadas" },
                    ].map((tab) => (
                      <button
                        key={tab.value}
                        onClick={() => setSelectedTab(tab.value as MoverRow["type"])}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          selectedTab === tab.value ? "bg-mint-50 text-mint-700" : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {movers
                      .filter((row) => row.type === selectedTab)
                      .slice(0, 6)
                      .map((row) => (
                        <button
                          key={`${row.ticker}-${row.type}`}
                          className="w-full flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-neutral-200 hover:bg-neutral-50 transition-all text-left"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              {getCompanyLogo(row.ticker) && (
                                <img
                                  src={getCompanyLogo(row.ticker)}
                                  alt={`Logo ${row.ticker}`}
                                  className="h-7 w-7 rounded-full border border-neutral-200 object-cover bg-white"
                                />
                              )}
                              <span className="text-sm font-semibold text-neutral-900">{row.ticker}</span>
                              <span className="text-xs text-neutral-500">{row.name}</span>
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">{row.note}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-neutral-500">{row.price}</p>
                            <p className={`text-sm font-semibold ${row.changePct.startsWith("-") ? "text-rose-600" : "text-emerald-600"}`}>
                              {row.changePct}
                            </p>
                            <div className="flex items-center justify-end gap-1 text-[10px] text-neutral-400 mt-1">
                              <ExternalLink className="w-3 h-3" />
                              Abrir
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>

                  <div className="mt-4 text-[11px] text-neutral-400">Fonte: B3 . Atualizado em 05/02</div>
                </div>

                {/* Volatilidade */}
                <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-neutral-900">Volatilidade do mercado</h3>
                      <p className="text-xs text-neutral-500">Indicador educacional de risco. Não é recomendação.</p>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setShowVolatilityInfo((prev) => !prev)}
                        className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-mint-100"
                        aria-label="Informações sobre volatilidade"
                      >
                        <Info className="w-4 h-4 text-neutral-500" />
                      </button>
                      {showVolatilityInfo && (
                        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-neutral-200 bg-white p-3 text-xs text-neutral-600 shadow-sm">
                          Volatilidade: medida de oscilação de preços. Maior volatilidade = preços variam mais.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-baseline gap-3">
                          <p className="text-3xl font-semibold text-neutral-900">{volatility.value}</p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs border ${
                              volatility.label === "Baixa"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : volatility.label === "Moderada"
                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                : "bg-rose-50 text-rose-700 border-rose-100"
                            }`}
                          >
                            {volatility.label}
                          </span>
                          <span className="text-xs text-neutral-500">? subindo</span>
                        </div>
                        <p className="text-sm text-neutral-600 mt-2">Volatilidade moderada costuma aumentar oscilações de preço.</p>
                      </div>
                      <button onClick={() => setShowVolatilityDetails(true)} className="text-xs text-neutral-500 hover:text-neutral-700">
                        Ver detalhes
                      </button>
                    </div>

                    <div>
                      <div className="relative h-3 rounded-full overflow-hidden bg-neutral-100">
                        <div className="absolute inset-y-0 left-0 w-1/3 bg-emerald-100" />
                        <div className="absolute inset-y-0 left-1/3 w-1/3 bg-amber-100" />
                        <div className="absolute inset-y-0 right-0 w-1/3 bg-rose-100" />
                        <div className="absolute top-0 h-full w-0.5 bg-neutral-900" style={{ left: "64%" }} />
                        <div className="absolute top-0 h-full w-0.5 bg-neutral-400" style={{ left: "55%" }} />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-2">
                        <span>Baixa</span>
                        <span>Moderada</span>
                        <span>Alta</span>
                      </div>
                      <GlossaryText
                        className="text-[11px] text-neutral-500 mt-2 block"
                        text="Janela: 30 dias . Referência: mediana 12m"
                      />
                    </div>

                    <ul className="text-xs text-neutral-600 space-y-2">
                      <li>Use mais margem de segurança ao comprar.</li>
                      <li>Evite alavancagem em semanas mais voláteis.</li>
                    </ul>

                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span>
                        Fonte: {volatility.source} . Atualizado em {volatility.updatedAt}
                      </span>
                      {volatilityIsStale && (
                        <span className="px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700">Desatualizado</span>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Resumo do dia */}
              <section className="bg-white rounded-2xl border border-[#EAECF0] p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-[#0B1220]">Resumo do dia</h3>
                    <p className="text-xs text-[#667085]">Curadoria educativa com base em fontes oficiais - não é recomendação.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {[
                      { label: "Mercado", enabled: true },
                      { label: "Setor", enabled: hasSectorSelected, tooltip: "Selecione um setor para ativar." },
                      { label: "Minha watchlist", enabled: hasWatchlist, tooltip: "Adicione empresas à watchlist para ativar." },
                    ]
                      .filter((option) => option.label !== "Minha watchlist" || hasWatchlist)
                      .map((option) => (
                        <button
                          key={option.label}
                          onClick={() => option.enabled && setSummaryScope(option.label as typeof summaryScope)}
                          title={!option.enabled ? option.tooltip : undefined}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            summaryScope === option.label
                              ? "border-[#0E9384] bg-[#E7F6F3] text-[#0E9384]"
                              : option.enabled
                              ? "border-[#EAECF0] text-[#475467] hover:border-[#D0D5DD]"
                              : "border-[#EAECF0] text-[#98A2B3] cursor-not-allowed"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  {summaryState === "loading" && (
                    <div className="space-y-3">
                      <div className="h-4 w-40 bg-[#F2F4F7] rounded" />
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="h-16 rounded-2xl bg-[#F2F4F7]" />
                      ))}
                    </div>
                  )}

                  {summaryState === "error" && (
                    <div className="rounded-2xl border border-[#EAECF0] bg-[#F7F8FA] p-4 text-sm text-[#475467]">
                      <p>Não foi possível carregar os destaques agora. Tente novamente.</p>
                      <button
                        onClick={() => setSummaryState("ready")}
                        className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#0E9384] focus:outline-none focus:ring-2 focus:ring-[#0E9384]/30"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  )}

                  {summaryState === "empty" && (
                    <div className="rounded-2xl border border-[#EAECF0] bg-[#F7F8FA] p-4 text-sm text-[#475467]">
                      <p>Ainda não temos destaques para exibir hoje.</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button className="px-3 py-2 rounded-xl border border-[#EAECF0] text-xs text-[#475467] hover:border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#0E9384]/30">
                          Explorar por pilares
                        </button>
                        <button className="px-3 py-2 rounded-xl bg-[#0E9384] text-white text-xs hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#0E9384]/30">
                          Ver empresas atualizadas
                        </button>
                      </div>
                    </div>
                  )}

                  {summaryState === "ready" && (
                    <>
                      <div className="space-y-3">
                        {highlights.map((item, index) => (
                          <div
                            key={item.id}
                            className={`flex flex-col gap-4 rounded-2xl border border-[#EAECF0] p-4 md:flex-row md:items-center md:justify-between ${
                              !showAllHighlights && index === 2 ? "hidden md:flex" : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {getCompanyLogo(item.ticker) && (
                                <img
                                  src={getCompanyLogo(item.ticker)}
                                  alt={`Logo ${item.ticker}`}
                                  className="h-9 w-9 rounded-full border border-neutral-200 object-cover bg-white self-center"
                                />
                              )}
                              <div className="flex flex-col gap-1">
                                <span className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${severityStyles[item.severity]}`}>
                                  {item.severity}
                                </span>
                                <p className="text-sm font-semibold text-[#0B1220] truncate">
                                  {item.ticker} - {item.changeTitle}
                                </p>
                                <p className="text-xs text-[#475467] truncate">Por que importa: {item.whyItMatters}</p>
                                <p className="text-xs text-[#667085]">
                                  Impacta: {item.pillar} . {item.timeframeLabel}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-start gap-2 md:items-end">
                              <button
                                onClick={() => applyHighlightPreset(item.filterPreset)}
                                className="px-3 py-2 rounded-xl bg-[#0E9384] text-white text-xs font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#0E9384]/30"
                              >
                                Ver empresas
                              </button>

                              <button
                                onClick={() => setSelectedSource(item)}
                                className="inline-flex items-center gap-1 text-xs text-[#475467] hover:text-[#0B1220] focus:outline-none focus:ring-2 focus:ring-[#0E9384]/30"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                Ver fonte
                              </button>

                              <Link to={`/empresa/${item.ticker}`} className="text-xs text-[#475467] hover:text-[#0B1220]">
                                Abrir empresa
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button onClick={() => setShowAllHighlights((prev) => !prev)} className="self-start text-xs text-[#475467] hover:text-[#0B1220] md:hidden">
                        {showAllHighlights ? "Ver menos" : "Ver mais"}
                      </button>
                    </>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-[#667085]">
                  <span>Última atualização: 05/02</span>
                  <span>.</span>
                  <span>Fontes: CVM, B3, RI</span>
                </div>
                <p className="mt-3 text-[11px] text-[#667085]">Isto é um resumo educacional. Não é recomendação de compra ou venda.</p>
              </section>

              {/* Entry points */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-neutral-900">Explorar por</h3>
                  <button onClick={clearEntryPoints} className="text-xs text-neutral-500 hover:text-neutral-700">
                    Limpar seleção
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {thesisCollections.map((entry) => (
                    <button
                      key={entry}
                      onClick={() => toggleEntryPoint(entry)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                        selectedEntryPoints.includes(entry)
                          ? "border-mint-200 bg-mint-50 text-mint-700"
                          : "border-neutral-200 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50"
                      }`}
                    >
                      {entry}
                    </button>
                  ))}
                </div>
              </section>

              {/* Empresas */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-neutral-900">Empresas para você analisar</h3>
                    <p className="text-xs text-neutral-500">Use filtros para refinar a lista.</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Filter className="w-4 h-4" />
                    {filteredCompanies.length} empresas
                  </div>
                </div>

                {activePreset && (
                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#EAECF0] bg-[#F7F8FA] px-3 py-2 text-xs text-[#475467]">
                    {appliedChips.map((chip) => (
                      <span key={chip} className="inline-flex items-center gap-1 rounded-full border border-[#EAECF0] bg-white px-2 py-1 text-[11px] text-[#475467]">
                        {chip}
                        <button onClick={clearPreset} className="text-[#98A2B3] hover:text-[#475467]">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <button onClick={clearPreset} className="ml-auto text-[11px] text-[#0E9384] hover:text-[#0B1220]">
                      Limpar
                    </button>
                  </div>
                )}

                {showStaleBanner && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700">
                    <span>Há {staleCount} empresas com dados antigos. Vale revisar a fonte antes de seguir.</span>
                    <button onClick={() => setFilters((p) => ({ ...p, freshness: "Antigo" }))} className="font-medium hover:text-amber-900">
                      Ver apenas antigos
                    </button>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Buscar dentro dos resultados"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-mint-100"
                    />
                  </div>

                  {(
                    [
                      {
                        label: "Setor",
                        key: "sector",
                        options: ["Todos", "Bancos", "Energia", "Indústria", "Saúde", "Consumo", "Construção"],
                      },
                      { label: "Tamanho", key: "size", options: ["Todos", "Grande", "Média", "Pequena"] },
                      { label: "Status", key: "status", options: ["Todos", "Saudável", "Atenção", "Risco"] },
                      { label: "Frescor", key: "freshness", options: ["Todos", "Atualizado", "Antigo"] },
                      { label: "Pilar em destaque", key: "pillar", options: ["Todos", ...pillars] },
                    ] as Array<{ label: string; key: FilterKey; options: string[] }>
                  ).map((filter) => (
                    <div key={filter.key} className="relative">
                      <select
                        value={filters[filter.key]}
                        onChange={(event) => setFilters((prev) => ({ ...prev, [filter.key]: event.target.value }))}
                        className="appearance-none px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-600 bg-white focus:outline-none focus:ring-2 focus:ring-mint-100"
                      >
                        {filter.options.map((option) => (
                          <option key={option} value={option}>
                            {filter.label}: {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  ))}

                  <div className="ml-auto flex items-center gap-2">
                    <ListFilter className="w-4 h-4 text-neutral-400" />
                  <select
                    value={filters.sort}
                    onChange={(event) => setFilters((prev) => ({ ...prev, sort: event.target.value }))}
                    className="appearance-none px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-600 bg-white focus:outline-none focus:ring-2 focus:ring-mint-100"
                  >
                      {[
                        ...(activePreset ? ["Mais relevantes para este destaque"] : []),
                        "Mais atualizadas",
                        "Mudanças recentes",
                        "Maior consistência",
                      ].map((option) => (
                        <option key={option} value={option}>
                          Ordenar: {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
                        <div className="h-4 w-32 bg-neutral-100 rounded mb-3" />
                        <div className="h-3 w-24 bg-neutral-100 rounded mb-4" />
                        <div className="h-16 bg-neutral-100 rounded mb-4" />
                        <div className="h-3 w-40 bg-neutral-100 rounded" />
                      </div>
                    ))}
                  </div>
                ) : filteredCompanies.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 text-center">
                    <p className="text-sm text-neutral-600 mb-3">Nenhuma empresa encontrada com esses filtros.</p>
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={resetFilters} className="px-4 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50">
                        Limpar filtros
                      </button>
                      <button
                        onClick={() => setFilters((p) => ({ ...p, sector: "Bancos" }))}
                        className="px-4 py-2 rounded-xl bg-mint-500 text-white text-sm hover:bg-mint-600"
                      >
                        Explorar por setor
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredCompanies.map((company) => (
                      <div key={company.ticker} className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getCompanyLogo(company.ticker) && (
                              <img
                                src={getCompanyLogo(company.ticker)}
                                alt={`Logo ${company.ticker}`}
                                className="h-10 w-10 rounded-full border border-neutral-200 object-cover bg-white"
                              />
                            )}
                            <div>
                              <h4 className="text-sm font-semibold text-neutral-900">
                                {company.name} <span className="text-neutral-400">•</span> {company.ticker}
                              </h4>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-neutral-200 text-neutral-500">
                                {company.sector}
                              </span>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs border ${statusColors[company.status]}`}>{company.status}</span>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          {pillars.map((pillar, index) => (
                            <div key={pillar} className="flex flex-col items-center">
                              <div
                                className={`w-10 h-1.5 rounded-full ${
                                  company.pillarsScores[index] >= 70 ? "bg-emerald-400" : company.pillarsScores[index] >= 50 ? "bg-amber-400" : "bg-rose-400"
                                }`}
                              />
                              <span className="text-[10px] text-neutral-500 mt-1">{pillar}</span>
                            </div>
                          ))}
                        </div>

                        <p className="text-sm text-neutral-600 mb-3">{company.shortDiagnosis}</p>

                        <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-4">
                          <span>
                            Fonte: {company.source} • Atualizado em {company.updatedAt}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] ${freshnessColors[company.freshnessStatus]}`}>
                            {company.freshnessStatus}
                          </span>
                        </div>

                        <div className="flex flex-col gap-3">
                          <Link
                            to={`/empresa/${company.ticker}`}
                            className="px-4 py-2 rounded-xl bg-[#0E9384] text-white text-xs font-medium hover:opacity-90 w-fit"
                          >
                            Abrir análise
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-neutral-500">
                            <button
                              onClick={() => toggleCompare(company.ticker)}
                              className={`px-3 py-2 rounded-xl border text-xs transition-colors ${
                                compareTickers.includes(company.ticker) ? "border-mint-200 bg-mint-50 text-mint-700" : "border-neutral-200 hover:bg-neutral-50"
                              }`}
                            >
                              Comparar
                            </button>
                            <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-neutral-200 hover:bg-neutral-50">
                              <Star className="w-4 h-4 text-neutral-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* Side rail */}
          <aside className="hidden xl:block w-80 self-start p-8 space-y-4">
            <div className="rounded-2xl border border-neutral-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-neutral-900">Qualidade dos dados</h4>
                <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
              </div>
              <p className="text-xs text-neutral-600">2 empresas sem atualização há 14 dias.</p>
              <p className="text-xs text-neutral-600">1 fonte falhou hoje às 09:20.</p>
              <button className="mt-3 text-xs text-mint-600 font-medium">Ver</button>
            </div>

            <div className="rounded-2xl border border-neutral-100 shadow-sm p-4">
              <h4 className="text-sm font-semibold text-neutral-900 mb-3">Atalhos</h4>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-600 hover:bg-neutral-50">
                  Ir para Watchlist
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-600 hover:bg-neutral-50">
                  Ver Alertas
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-600 hover:bg-neutral-50">
                  Comparar
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-100 shadow-sm p-4">
              <h4 className="text-sm font-semibold text-neutral-900 mb-3">Como usar</h4>
              <ul className="text-xs text-neutral-600 space-y-2">
                <li>Comece pelo diagnàstico para entender o contexto.</li>
                <li>Clique no pilar para ver o porquê.</li>
                <li>Confira a fonte antes de aprofundar.</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      {/* Compare bar */}
      {compareTickers.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white border border-neutral-200 shadow-lg rounded-2xl px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Comparar:</span>
            {compareTickers.map((ticker) => (
              <span key={ticker} className="flex items-center gap-1 px-2 py-1 rounded-full bg-neutral-100 text-xs text-neutral-700">
                {ticker}
                <button onClick={() => toggleCompare(ticker)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <button className="px-3 py-2 rounded-xl bg-mint-500 text-white text-xs font-medium hover:bg-mint-600">
            Comparar ({compareTickers.length}/4)
          </button>
        </div>
      )}

      {/* Source drawer */}
      <Drawer open={!!selectedSource} onClose={() => setSelectedSource(null)} title="Detalhes da fonte">
        {selectedSource && (
          <div className="space-y-4 text-sm text-[#475467]">
            <div>
              <p className="text-xs text-[#667085]">Fonte</p>
              <p className="font-medium text-[#0B1220]">{selectedSource.source.name}</p>
            </div>
            <div>
              <p className="text-xs text-[#667085]">Documento</p>
              <p className="font-medium text-[#0B1220]">{selectedSource.source.docLabel}</p>
            </div>
            <div>
              <p className="text-xs text-[#667085]">Data de referência</p>
              <p className="font-medium text-[#0B1220]">{selectedSource.source.updatedAt}</p>
            </div>
            {selectedSource.source.url && (
              <a href={selectedSource.source.url} className="inline-flex items-center gap-2 text-xs text-[#0E9384] hover:text-[#0B1220]">
                Ver documento externo
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </Drawer>

      {/* Volatility drawer */}
      <Drawer open={showVolatilityDetails} onClose={() => setShowVolatilityDetails(false)} title="Detalhes da volatilidade">
        <div className="space-y-4 text-sm text-[#475467]">
          <p>Volatilidade é a medida de quanto os preços oscilam em um período. Níveis mais altos indicam variações maiores no curto prazo.</p>
          <p>O score combina amplitude média de movimentos e dispersão diária, com referência à mediana dos últimos 12 meses.</p>
          <div>
            <p className="text-xs text-[#667085]">Fontes e atualização</p>
            <p className="font-medium text-[#0B1220]">B3 . Atualização diária (D+1)</p>
          </div>
          <p className="text-xs text-[#667085]">Este indicador é educacional e não representa recomendação de compra ou venda.</p>
        </div>
      </Drawer>
    </div>
  );
}

export default ExplorePage;
