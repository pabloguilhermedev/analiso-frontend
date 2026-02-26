import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  Bell,
  Bookmark,
  ChevronDown,
  ChevronRight,
  Compass,
  Database,
  Ellipsis,
  FileText,
  LayoutGrid,
  Menu,
  Moon,
  PanelLeft,
  Search,
  Settings,
  Sun,
  UserCircle2,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { cn } from "./ui/utils";

import logoItau from "../assets/logos/itau.png";
import logoMrv from "../assets/logos/mrv.jpg";
import logoRenner from "../assets/logos/renner.png";
import logoTaesa from "../assets/logos/taesa.png";
import logoVale from "../assets/logos/vale.png";
import logoWeg from "../assets/logos/weg.jpeg";

type Status = "Saudável" | "Atenção" | "Risco";
type Pillar = "Dívida" | "Caixa" | "Margens" | "Retorno" | "Proventos";
type WindowRange = "24h" | "7d" | "30d";
type InboxSource = "CVM" | "B3" | "RI";
type InboxSort = "Impacto" | "Mais recente";
type InboxEventType = "mudanca" | "evento_futuro";
type InboxMode = "top-impacto" | "tempo-real";

type PillarMovement = {
  pillar: Pillar;
  events: number;
  trendLabel: string;
  trendUp: boolean;
  risk: number;
  attention: number;
  healthy: number;
};

type InboxSeedItem = {
  id: string;
  companyId: string;
  ticker: string;
  companyName: string;
  title: string;
  whyItMatters: string;
  severity: Status;
  pillarKey?: Pillar;
  source?: InboxSource;
  ageMinutes: number;
  impactScore: number;
  eventType: InboxEventType;
};

type InboxItem = Omit<InboxSeedItem, "ageMinutes"> & {
  timestamp: string;
  relativeTime: string;
  ageMinutes: number;
};

type InboxFilters = {
  period: WindowRange;
  severities: Status[];
  pillars: Pillar[];
  sources: InboxSource[];
  sortBy: InboxSort;
};

const INBOX_FILTERS_STORAGE_KEY = "dashboard-inbox-filters:v1";
const INBOX_MODE_STORAGE_KEY = "dashboard-inbox-mode:v1";
const NEW_ITEM_HIGHLIGHT_MS = 10_000;

const allStatuses: Status[] = ["Risco", "Atenção", "Saudável"];
const allPillars: Pillar[] = ["Dívida", "Caixa", "Margens", "Retorno", "Proventos"];
const allSources: InboxSource[] = ["CVM", "B3", "RI"];

const logoByTicker: Record<string, string> = {
  VALE3: logoVale,
  LREN3: logoRenner,
  ITUB4: logoItau,
  MRVE3: logoMrv,
  TAEE11: logoTaesa,
  WEGE3: logoWeg,
};

const statusClasses: Record<Status, string> = {
  Saudável: "border-emerald-300 bg-emerald-100 text-emerald-900",
  Atenção: "border-amber-300 bg-amber-100 text-amber-900",
  Risco: "border-rose-300 bg-rose-100 text-rose-900",
};

type NavItem = {
  icon: typeof Activity;
  label: string;
  path?: string;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    label: "PRINCIPAL",
    items: [
      { icon: LayoutGrid, label: "Dashboard", path: "/dashboard" },
      { icon: Bookmark, label: "Watchlist", path: "/watchlist" },
      { icon: Compass, label: "Explorar", path: "/explorar" },
    ],
  },
  {
    label: "ANÁLISE",
    items: [
      { icon: Activity, label: "Indicadores" },
      { icon: Activity, label: "Atividade" },
    ],
  },
  {
    label: "RELATÓRIOS",
    items: [
      { icon: FileText, label: "Relatórios" },
      { icon: Database, label: "Fontes" },
    ],
  },
  {
    label: "APPS",
    items: [{ icon: Settings, label: "Configurações" }],
  },
];

const inboxSeed: InboxSeedItem[] = [
  {
    id: "evt-vale-divida-1",
    companyId: "VALE3",
    ticker: "VALE3",
    companyName: "Vale",
    title: "Dívida líquida/EBITDA acima do limite interno",
    whyItMatters: "Aumento da alavancagem pode reduzir flexibilidade financeira.",
    severity: "Risco",
    pillarKey: "Dívida",
    source: "CVM",
    ageMinutes: 3,
    impactScore: 99,
    eventType: "mudanca",
  },
  {
    id: "evt-lren-margens-1",
    companyId: "LREN3",
    ticker: "LREN3",
    companyName: "Lojas Renner",
    title: "Margens pressionadas no trimestre",
    whyItMatters: "Compressão de margem pode limitar revisão positiva de lucro.",
    severity: "Atenção",
    pillarKey: "Margens",
    source: "RI",
    ageMinutes: 11,
    impactScore: 84,
    eventType: "mudanca",
  },
  {
    id: "evt-mrve-caixa-1",
    companyId: "MRVE3",
    ticker: "MRVE3",
    companyName: "MRV Engenharia",
    title: "Queda em caixa livre no período",
    whyItMatters: "Menor geração de caixa aumenta risco de execução no curto prazo.",
    severity: "Atenção",
    pillarKey: "Caixa",
    source: "B3",
    ageMinutes: 17,
    impactScore: 81,
    eventType: "mudanca",
  },
  {
    id: "evt-taee-retorno-1",
    companyId: "TAEE11",
    ticker: "TAEE11",
    companyName: "Taesa",
    title: "Retorno segue resiliente",
    whyItMatters: "Indicadores estáveis sinalizam consistência operacional.",
    severity: "Saudável",
    pillarKey: "Retorno",
    source: "RI",
    ageMinutes: 44,
    impactScore: 58,
    eventType: "mudanca",
  },
  {
    id: "evt-itub-proventos-1",
    companyId: "ITUB4",
    ticker: "ITUB4",
    companyName: "Itaú Unibanco",
    title: "Proventos em trajetória estável",
    whyItMatters: "Consistência em distribuição reforça previsibilidade de retorno.",
    severity: "Saudável",
    pillarKey: "Proventos",
    source: "RI",
    ageMinutes: 130,
    impactScore: 49,
    eventType: "mudanca",
  },
  {
    id: "evt-weg-evento-1",
    companyId: "WEGE3",
    ticker: "WEGE3",
    companyName: "WEG",
    title: "Resultado 4T25 agendado para esta semana",
    whyItMatters: "Evento futuro pode alterar diagnóstico de Margens e Retorno.",
    severity: "Atenção",
    pillarKey: "Margens",
    source: "RI",
    ageMinutes: 260,
    impactScore: 76,
    eventType: "evento_futuro",
  },
  {
    id: "evt-vale-caixa-2",
    companyId: "VALE3",
    ticker: "VALE3",
    companyName: "Vale",
    title: "Geração de caixa abaixo da referência",
    whyItMatters: "Pode elevar dependência de financiamento no curto prazo.",
    severity: "Risco",
    pillarKey: "Caixa",
    source: "CVM",
    ageMinutes: 1220,
    impactScore: 90,
    eventType: "mudanca",
  },
  {
    id: "evt-weg-margens-2",
    companyId: "WEGE3",
    ticker: "WEGE3",
    companyName: "WEG",
    title: "Margem bruta cedeu no trimestre",
    whyItMatters: "Pode reduzir ganho operacional se o mix piorar.",
    severity: "Atenção",
    pillarKey: "Margens",
    source: "CVM",
    ageMinutes: 3160,
    impactScore: 73,
    eventType: "mudanca",
  },
  {
    id: "evt-itub-retorno-2",
    companyId: "ITUB4",
    ticker: "ITUB4",
    companyName: "Itaú Unibanco",
    title: "ROE mantém acima da referência",
    whyItMatters: "Sinaliza eficiência de alocação de capital no ciclo.",
    severity: "Saudável",
    pillarKey: "Retorno",
    source: "B3",
    ageMinutes: 7420,
    impactScore: 52,
    eventType: "mudanca",
  },
];

const pillarMovements: PillarMovement[] = [
  { pillar: "Dívida", events: 12, trendLabel: "up 18%", trendUp: true, risk: 3, attention: 7, healthy: 2 },
  { pillar: "Margens", events: 9, trendLabel: "up 10%", trendUp: true, risk: 2, attention: 6, healthy: 1 },
  { pillar: "Caixa", events: 7, trendLabel: "down 6%", trendUp: false, risk: 1, attention: 2, healthy: 4 },
  { pillar: "Proventos", events: 5, trendLabel: "up 4%", trendUp: true, risk: 0, attention: 2, healthy: 3 },
  { pillar: "Retorno", events: 4, trendLabel: "up 3%", trendUp: true, risk: 0, attention: 1, healthy: 3 },
];

function toggleInArray<T>(arr: T[], value: T) {
  return arr.includes(value) ? arr.filter((entry) => entry !== value) : [...arr, value];
}

function includesAll<T>(selected: T[], all: T[]) {
  if (selected.length === 0) return true;
  return selected.length === all.length && all.every((item) => selected.includes(item));
}

function defaultInboxFilters(): InboxFilters {
  return {
    period: "24h",
    severities: allStatuses,
    pillars: allPillars,
    sources: allSources,
    sortBy: "Impacto",
  };
}

function loadInboxFilters(): InboxFilters {
  const fallback = defaultInboxFilters();
  try {
    const raw = window.localStorage.getItem(INBOX_FILTERS_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<InboxFilters>;
    return {
      period: parsed.period ?? fallback.period,
      severities: parsed.severities?.length ? parsed.severities : fallback.severities,
      pillars: parsed.pillars?.length ? parsed.pillars : fallback.pillars,
      sources: parsed.sources?.length ? parsed.sources : fallback.sources,
      sortBy: parsed.sortBy ?? fallback.sortBy,
    };
  } catch {
    return fallback;
  }
}

function loadInboxMode(): InboxMode {
  try {
    const raw = window.localStorage.getItem(INBOX_MODE_STORAGE_KEY);
    if (raw === "tempo-real" || raw === "top-impacto") return raw;
  } catch {
    // ignore storage errors
  }
  return loadInboxFilters().sortBy === "Mais recente" ? "tempo-real" : "top-impacto";
}

function getPeriodLimitMinutes(period: WindowRange) {
  if (period === "24h") return 24 * 60;
  if (period === "7d") return 7 * 24 * 60;
  return 30 * 24 * 60;
}

function relativeFromMinutes(minutes: number) {
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  return `há ${days} d`;
}

function relativeFromTimestamp(timestamp: number) {
  const deltaMs = Date.now() - timestamp;
  const minutes = Math.max(0, Math.floor(deltaMs / 60_000));
  if (minutes < 1) return "há 0 min";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  return `há ${days} d`;
}

function toPillarQueryKey(pillar?: Pillar) {
  if (!pillar) return "";
  if (pillar === "Dívida") return "divida";
  if (pillar === "Caixa") return "caixa";
  if (pillar === "Margens") return "margens";
  if (pillar === "Retorno") return "retorno";
  return "proventos";
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge className={cn("inline-flex h-7 min-w-[82px] items-center justify-center rounded-full border px-3 text-xs font-semibold", statusClasses[status])}>
      {status}
    </Badge>
  );
}

function SegmentedHealthBar({ healthy, attention, risk }: { healthy: number; attention: number; risk: number }) {
  const total = Math.max(healthy + attention + risk, 1);
  const healthyW = (healthy / total) * 100;
  const attentionW = (attention / total) * 100;
  const riskW = (risk / total) * 100;

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#F2F4F7]">
      <div className="h-full bg-emerald-500" style={{ width: `${healthyW}%`, float: "left" }} />
      <div className="h-full bg-amber-400" style={{ width: `${attentionW}%`, float: "left" }} />
      <div className="h-full bg-rose-500" style={{ width: `${riskW}%`, float: "left" }} />
    </div>
  );
}

export function AppSidebar({
  collapsed = false,
  mobile = false,
  isDarkMode = false,
  currentPath,
  onNavigate,
}: {
  collapsed?: boolean;
  mobile?: boolean;
  isDarkMode?: boolean;
  currentPath?: string;
  onNavigate?: (path: string) => void;
}) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r",
        isDarkMode ? "border-[#1F2937] bg-[#0F172A]" : "border-[#EAECF0] bg-white",
        mobile ? "w-[240px]" : collapsed ? "w-16" : "w-[240px]",
      )}
    >
      <div className={cn("border-b px-3 pb-3 pt-4", isDarkMode ? "border-[#1F2937]" : "border-[#EAECF0]")}>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-[#0E9384]" />
          {!collapsed && <span className={cn("text-[15px] font-semibold", isDarkMode ? "text-[#F3F4F6]" : "text-[#101828]")}>Analiso</span>}
          {!collapsed && <ChevronDown className={cn("ml-auto h-4 w-4", isDarkMode ? "text-[#9CA3AF]" : "text-[#667085]")} />}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-2 py-3">
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && <p className={cn("px-2 py-2 text-[11px] font-medium tracking-[0.06em]", isDarkMode ? "text-[#9CA3AF]" : "text-[#98A2B3]")}>{section.label}</p>}
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = Boolean(item.path && currentPath === item.path);
                return (
                  <button
                    key={item.label}
                    onClick={() => item.path && onNavigate?.(item.path)}
                    className={cn(
                      "flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 text-left text-[14px] font-medium transition-colors",
                      active
                        ? isDarkMode
                          ? "bg-[#1E293B] text-[#F3F4F6]"
                          : "bg-[#F2F4F7] text-[#101828]"
                        : isDarkMode
                          ? "text-[#9CA3AF] hover:bg-[#111827] hover:text-[#F3F4F6]"
                          : "text-[#667085] hover:bg-[#F8FAFC] hover:text-[#101828]",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", active ? (isDarkMode ? "text-[#F3F4F6]" : "text-[#101828]") : isDarkMode ? "text-[#9CA3AF]" : "text-[#667085]")} />
                    {!collapsed && <span className={active ? "font-semibold" : ""}>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className={cn("mt-auto border-t p-3", isDarkMode ? "border-[#1F2937]" : "border-[#EAECF0]")}>
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-[11px]">JS</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0">
              <p className={cn("truncate text-[13px] font-semibold", isDarkMode ? "text-[#F3F4F6]" : "text-[#101828]")}>João Silva</p>
              <p className={cn("truncate text-[11px]", isDarkMode ? "text-[#9CA3AF]" : "text-[#667085]")}>joao@analiso.com.br</p>
            </div>
          )}
          {!collapsed && <Ellipsis className={cn("ml-auto h-4 w-4", isDarkMode ? "text-[#9CA3AF]" : "text-[#667085]")} />}
        </div>
      </div>
    </aside>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [inboxError, setInboxError] = useState(false);
  const [inboxFilters, setInboxFilters] = useState<InboxFilters>(() => loadInboxFilters());
  const [inboxMode, setInboxMode] = useState<InboxMode>(() => loadInboxMode());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState(() => Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [clockTick, setClockTick] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [realtimeItems, setRealtimeItems] = useState<InboxSeedItem[]>([]);
  const [newBadgeUntil, setNewBadgeUntil] = useState<Record<string, number>>({});
  const inboxRef = useRef<HTMLElement | null>(null);
  const refreshSequenceRef = useRef(0);

  const isLoading = false;
  const sourceFailed = false;
  const activeSeverities = inboxFilters.severities.length ? inboxFilters.severities : allStatuses;
  const activePillars = inboxFilters.pillars.length ? inboxFilters.pillars : allPillars;
  const activeSources = inboxFilters.sources.length ? inboxFilters.sources : allSources;
  const hasSeverityFilter = !includesAll(inboxFilters.severities, allStatuses);
  const hasPillarFilter = !includesAll(inboxFilters.pillars, allPillars);
  const hasSourceFilter = !includesAll(inboxFilters.sources, allSources);
  const hasPeriodFilter = inboxFilters.period !== "24h";
  const hasAnyFilterOverride = hasSeverityFilter || hasPillarFilter || hasSourceFilter || hasPeriodFilter;
  const advancedFiltersCount = Number(hasSeverityFilter) + Number(hasPillarFilter) + Number(hasSourceFilter);
  const showFiltersCount = advancedFiltersCount > 0;

  const inboxItems = useMemo<InboxItem[]>(
    () =>
      [...realtimeItems, ...inboxSeed].map((item) => ({
        ...item,
        ageMinutes: item.ageMinutes,
        timestamp: new Date(lastRefreshAt - item.ageMinutes * 60_000).toISOString(),
        relativeTime: relativeFromMinutes(item.ageMinutes),
      })),
    [lastRefreshAt, realtimeItems],
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(INBOX_FILTERS_STORAGE_KEY, JSON.stringify(inboxFilters));
    } catch {
      // ignore storage errors
    }
  }, [inboxFilters]);

  useEffect(() => {
    try {
      window.localStorage.setItem(INBOX_MODE_STORAGE_KEY, inboxMode);
    } catch {
      // ignore storage errors
    }
  }, [inboxMode]);

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem("analiso-theme");
      const shouldUseDark =
        savedTheme === "dark" ||
        (!savedTheme && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
      setIsDarkMode(shouldUseDark);
      document.documentElement.classList.toggle("dark", shouldUseDark);
    } catch {
      // ignore theme storage errors
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    try {
      window.localStorage.setItem("analiso-theme", isDarkMode ? "dark" : "light");
    } catch {
      // ignore theme storage errors
    }
  }, [isDarkMode]);

  useEffect(() => {
    setInboxFilters((prev) => {
      const expectedSort: InboxSort = inboxMode === "tempo-real" ? "Mais recente" : "Impacto";
      if (prev.sortBy === expectedSort) return prev;
      return { ...prev, sortBy: expectedSort };
    });
  }, [inboxMode]);

  useEffect(() => {
    const timer = window.setInterval(() => setClockTick((prev) => prev + 1), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const now = Date.now();
    setNewBadgeUntil((prev) => {
      const next = Object.fromEntries(Object.entries(prev).filter(([, expiresAt]) => expiresAt > now));
      return Object.keys(next).length === Object.keys(prev).length ? prev : next;
    });
  }, [clockTick]);

  useEffect(() => {
    const clearNewBadgesOnInteraction = () => {
      setNewBadgeUntil((prev) => (Object.keys(prev).length ? {} : prev));
    };

    window.addEventListener("scroll", clearNewBadgesOnInteraction, { passive: true });
    window.addEventListener("pointerdown", clearNewBadgesOnInteraction, { passive: true });
    window.addEventListener("keydown", clearNewBadgesOnInteraction);
    window.addEventListener("touchstart", clearNewBadgesOnInteraction, { passive: true });

    return () => {
      window.removeEventListener("scroll", clearNewBadgesOnInteraction);
      window.removeEventListener("pointerdown", clearNewBadgesOnInteraction);
      window.removeEventListener("keydown", clearNewBadgesOnInteraction);
      window.removeEventListener("touchstart", clearNewBadgesOnInteraction);
    };
  }, []);

  const inboxRows = useMemo(() => {
    const limit = getPeriodLimitMinutes(inboxFilters.period);
    return inboxItems
      .filter((item) => item.ageMinutes <= limit)
      .filter((item) => activeSeverities.includes(item.severity))
      .filter((item) => (item.pillarKey ? activePillars.includes(item.pillarKey) : true))
      .filter((item) => (item.source ? activeSources.includes(item.source) : true))
      .sort((a, b) => {
        if (inboxFilters.sortBy === "Impacto") {
          return b.impactScore - a.impactScore;
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
  }, [activePillars, activeSeverities, activeSources, inboxFilters, inboxItems]);

  const refreshInboxNow = () => {
    try {
      setIsRefreshing(true);
      const now = Date.now();
      setLastRefreshAt(now);
      if (inboxMode === "tempo-real") {
        const template = inboxSeed[refreshSequenceRef.current % inboxSeed.length];
        refreshSequenceRef.current += 1;
        const realtimeItem: InboxSeedItem = {
          ...template,
          id: `${template.id}-rt-${now}`,
          ageMinutes: 0,
          impactScore: Math.min(100, template.impactScore + 3),
        };
        setRealtimeItems((prev) => [realtimeItem, ...prev].slice(0, 12));
        setNewBadgeUntil((prev) => ({ ...prev, [realtimeItem.id]: now + NEW_ITEM_HIGHLIGHT_MS }));
      }
      setRefreshError(null);
      setInboxError(false);
    } catch {
      setRefreshError("Falha ao atualizar. Tentar novamente.");
      setInboxError(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (inboxMode !== "tempo-real") return;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      refreshInboxNow();
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [inboxMode]);

  const openInboxItem = (item: InboxItem) => {
    const params = new URLSearchParams();
    if (item.pillarKey) {
      params.set("pilar", toPillarQueryKey(item.pillarKey));
      params.set("expand", toPillarQueryKey(item.pillarKey));
    }

    if (item.eventType === "evento_futuro") {
      params.set("tab", "eventos");
      params.set("foco", "agenda");
    } else if (item.pillarKey) {
      params.set("tab", "pilares");
      params.set("foco", "pilar");
    } else {
      params.set("tab", "mudancas");
      params.set("foco", "mudancas");
    }

    navigate(`/empresa/${item.ticker}?${params.toString()}`);
  };

  const applySinglePillarFilter = (pillar: Pillar) => {
    setInboxFilters((prev) => ({ ...prev, pillars: [pillar] }));
    inboxRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const focusInboxRecentImpact = () => {
    setInboxMode("top-impacto");
    setInboxFilters((prev) => ({ ...prev, period: "24h", sortBy: "Impacto" }));
    inboxRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const setImpactMode = () => {
    setInboxMode("top-impacto");
    setInboxFilters((prev) => ({ ...prev, period: "24h", sortBy: "Impacto" }));
  };

  const setRealTimeMode = () => {
    setInboxMode("tempo-real");
    setInboxFilters((prev) => ({ ...prev, period: "24h", sortBy: "Mais recente" }));
    refreshInboxNow();
  };

  const clearInboxFilters = () => {
    setInboxMode("top-impacto");
    setInboxFilters(defaultInboxFilters());
    setRealtimeItems([]);
    setNewBadgeUntil({});
  };

  const focusedPillar = inboxFilters.pillars.length === 1 ? inboxFilters.pillars[0] : pillarMovements[0].pillar;

  const kpiCards = [
    {
      title: "Saúde da watchlist",
      value: "59%",
      subtitle: "empresas saudáveis",
      delta: "+2,1 p.p vs semana passada",
      deltaPositive: true,
      ctaLabel: "Ver detalhes",
      action: () => navigate("/watchlist?filtro=saude"),
    },
    {
      title: "Empresas monitoradas",
      value: "20",
      subtitle: "na watchlist",
      delta: "+2 este mês",
      deltaPositive: true,
      ctaLabel: "Ver lista",
      action: () => navigate("/watchlist"),
    },
    {
      title: "Mudanças hoje",
      value: "14",
      subtitle: "eventos relevantes",
      delta: "-0,8 vs ontem",
      deltaPositive: false,
      ctaLabel: "Abrir inbox",
      action: focusInboxRecentImpact,
    },
    {
      title: "Alertas ativos",
      value: "9",
      subtitle: "monitoramentos em aberto",
      delta: "+20,1% este mês",
      deltaPositive: true,
      ctaLabel: "Ver alertas",
      action: () => navigate("/watchlist?tab=alertas"),
    },
  ];

  const severityCount = useMemo(() => {
    return inboxRows.reduce(
      (acc, item) => {
        if (item.severity === "Risco") acc.risk += 1;
        if (item.severity === "Atenção") acc.attention += 1;
        if (item.severity === "Saudável") acc.healthy += 1;
        return acc;
      },
      { risk: 0, attention: 0, healthy: 0 },
    );
  }, [inboxRows]);

  const summaryParts = [
    `Período: ${inboxFilters.period}`,
    `Ordenação: ${inboxFilters.sortBy}`,
    hasSeverityFilter ? `Severidade: ${activeSeverities.join(", ")}` : null,
    hasPillarFilter ? `Pilar: ${activePillars.join(", ")}` : null,
    hasSourceFilter ? `Fonte: ${activeSources.join(", ")}` : null,
  ].filter(Boolean) as string[];

  const refreshLabel = useMemo(() => relativeFromTimestamp(lastRefreshAt), [lastRefreshAt, clockTick]);

  return (
    <div className={cn("min-h-screen", isDarkMode ? "bg-[#020617] text-[#E5E7EB]" : "bg-[#F8FAFC] text-[#101828]")}>
      <div className={cn("hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:block", sidebarCollapsed ? "md:w-16" : "md:w-[240px]")}>
        <AppSidebar isDarkMode={isDarkMode} collapsed={sidebarCollapsed} currentPath={location.pathname} onNavigate={navigate} />
      </div>

      <div className={cn(sidebarCollapsed ? "md:pl-16" : "md:pl-[240px]")}>
        <header className={cn("sticky top-0 z-20 h-12 border-b", isDarkMode ? "border-[#1F2937] bg-[#0B1220]" : "border-[#EAECF0] bg-white")}>
          <div className="flex h-full items-center justify-between px-6">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5 text-[#667085]" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                  <AppSidebar isDarkMode={isDarkMode} mobile currentPath={location.pathname} onNavigate={navigate} />
                </SheetContent>
              </Sheet>

              <Button
                variant="ghost"
                size="icon"
                className={cn("hidden h-8 w-8 shrink-0 rounded-md md:inline-flex", isDarkMode ? "text-[#9CA3AF] hover:bg-[#1F2937]" : "text-[#667085] hover:bg-[#F2F4F7]")}
                onClick={() => setSidebarCollapsed((prev) => !prev)}
                aria-label={sidebarCollapsed ? "Expandir sidebar" : "Minimizar sidebar"}
                title={sidebarCollapsed ? "Expandir sidebar" : "Minimizar sidebar"}
              >
                <PanelLeft className="h-[18px] w-[18px]" />
              </Button>
              <div className={cn("hidden h-9 w-full max-w-[520px] items-center rounded-lg border-2 px-3 md:flex", isDarkMode ? "border-[#4B5563] bg-[#111827]" : "border-[#D0D5DD] bg-white")}>
                <Search className={cn("h-4 w-4", isDarkMode ? "text-[#9CA3AF]" : "text-[#98A2B3]")} />
                <Input
                  className={cn("h-8 border-0 bg-transparent px-2 text-[14px] shadow-none ring-0 focus-visible:ring-0", isDarkMode ? "text-[#E5E7EB] placeholder:text-[#9CA3AF]" : "")}
                  placeholder="Busque empresa ou ticker..."
                />
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                <Bell className={cn("h-[30px] w-[30px]", isDarkMode ? "text-[#9CA3AF]" : "text-[#667085]")} />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Settings className={cn("h-[30px] w-[30px]", isDarkMode ? "text-[#9CA3AF]" : "text-[#667085]")} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setIsDarkMode((prev) => !prev)}
                aria-label={isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"}
                title={isDarkMode ? "Modo claro" : "Modo escuro"}
              >
                {isDarkMode ? <Sun className="h-5 w-5 text-[#FBBF24]" /> : <Moon className="h-5 w-5 text-[#667085]" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <UserCircle2 className={cn("h-5 w-5", isDarkMode ? "text-[#9CA3AF]" : "text-[#667085]")} />
              </Button>
            </div>
          </div>
        </header>

        <main className="space-y-6 px-6 pb-10 pt-6">
          <section className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h1 className={cn("text-[24px] font-semibold", isDarkMode ? "text-[#F3F4F6]" : "text-[#101828]")}>Dashboard</h1>
              <span className={cn("rounded-full border px-2.5 py-1 text-[12px]", isDarkMode ? "border-[#374151] bg-[#111827] text-[#9CA3AF]" : "border-[#EAECF0] bg-white text-[#667085]")}>Atualizado em 05/02</span>
            </div>
            <Button className="h-8 rounded-lg bg-[#0E9384] px-3 text-[12px] font-semibold text-white hover:bg-[#0B7F74]">+ Criar alerta</Button>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kpiCards.map((card, idx) => (
              <button
                key={card.title}
                onClick={card.action}
                className={cn(
                  "group rounded-2xl border p-4 text-left transition-all duration-150",
                  isDarkMode
                    ? "border-[#1F2937] bg-[#0F172A] hover:border-[#334155] hover:shadow-[0_2px_10px_rgba(0,0,0,0.35)]"
                    : "border-[#EAECF0] bg-white hover:border-[#D0D5DD] hover:shadow-[0_2px_10px_rgba(16,24,40,0.06)]",
                )}
              >
                <div className={cn("mb-2 border-b pb-2 text-[12px] font-medium", isDarkMode ? "border-[#1F2937] text-[#9CA3AF]" : "border-[#F2F4F7] text-[#667085]")}>{card.title}</div>

                {idx === 0 ? (
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full"
                      style={{
                        background: "conic-gradient(#22C55E 0 59%, #F59E0B 59% 87%, #EF4444 87% 100%)",
                      }}
                    >
                      <div className="m-[4px] h-8 w-8 rounded-full bg-white" />
                    </div>
                    <div>
                      <p className={cn("text-[28px] leading-none font-semibold", isDarkMode ? "text-[#F3F4F6]" : "text-[#101828]")}>{card.value}</p>
                      <p className={cn("mt-1 text-[12px]", isDarkMode ? "text-[#9CA3AF]" : "text-[#667085]")}>{card.subtitle}</p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3">
                    <p className={cn("text-[28px] leading-none font-semibold", isDarkMode ? "text-[#F3F4F6]" : "text-[#101828]")}>{card.value}</p>
                    <p className={cn("mt-1 text-[12px]", isDarkMode ? "text-[#9CA3AF]" : "text-[#667085]")}>{card.subtitle}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className={cn("text-[12px] font-medium", card.deltaPositive ? "text-emerald-600" : "text-rose-600")}>{card.delta}</p>
                  <span className="text-[12px] font-semibold text-[#0E9384]">{card.ctaLabel}</span>
                </div>
              </button>
            ))}
          </section>

          <section ref={inboxRef} className="grid gap-4 xl:grid-cols-3">
            <Card className={cn("rounded-2xl border xl:col-span-2", isDarkMode ? "border-[#1F2937] bg-[#0F172A]" : "border-[#EAECF0] bg-white")}>
              <CardHeader className="space-y-3 px-4 pt-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className={cn("text-[16px] font-semibold", isDarkMode ? "text-[#F3F4F6]" : "text-[#101828]")}>Atualizações da watchlist</CardTitle>
                    <CardDescription className={cn("text-[14px]", isDarkMode ? "text-[#9CA3AF]" : "text-[#667085]")}>Tudo que mudou na sua watchlist, com prioridade e motivo.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-lg border border-[#D0D5DD] bg-white p-0.5">
                      <button
                        onClick={setImpactMode}
                        className={cn(
                          "rounded-md px-2.5 py-1.5 text-[12px] font-semibold transition",
                          inboxMode === "top-impacto" ? "bg-[#0E9384] text-white" : "text-[#667085] hover:bg-[#F2F4F7]",
                        )}
                      >
                        Top impacto
                      </button>
                      <button
                        onClick={setRealTimeMode}
                        className={cn(
                          "rounded-md px-2.5 py-1.5 text-[12px] font-semibold transition",
                          inboxMode === "tempo-real" ? "bg-[#0E9384] text-white" : "text-[#667085] hover:bg-[#F2F4F7]",
                        )}
                      >
                        Tempo real
                      </button>
                    </div>
                  </div>
                </div>

                <div className={cn("rounded-xl border p-3", isDarkMode ? "border-[#1F2937] bg-[#111827]" : "border-[#EAECF0] bg-[#FCFCFD]")}>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <p className="text-[12px] font-medium text-[#667085]">Período</p>
                    {(["24h", "7d", "30d"] as WindowRange[]).map((range) => (
                      <button
                        key={range}
                        onClick={() => setInboxFilters((prev) => ({ ...prev, period: range }))}
                        className={cn(
                          "h-7 rounded-full border px-3 text-[11px] font-medium",
                          inboxFilters.period === range
                            ? "border-[#0E9384] bg-[#0E9384] text-white"
                            : isDarkMode
                              ? "border-[#374151] bg-[#0F172A] text-[#9CA3AF] hover:bg-[#1F2937]"
                              : "border-[#EAECF0] bg-white text-[#667085] hover:bg-[#F9FAFB]",
                        )}
                      >
                        {range}
                      </button>
                    ))}
                    {inboxMode === "tempo-real" && (
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-[12px] font-medium text-[#667085]">Ordenado por:</span>
                        <span className={cn("h-7 rounded-full border px-3 text-[11px] leading-7", isDarkMode ? "border-[#374151] bg-[#0F172A] text-[#D1D5DB]" : "border-[#D0D5DD] bg-white text-[#344054]")}>
                          Mais recente
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => setFiltersOpen((prev) => !prev)}
                      className={cn("rounded-lg border px-3 py-1.5 text-[12px] font-medium", isDarkMode ? "border-[#374151] bg-[#0F172A] text-[#D1D5DB] hover:bg-[#1F2937]" : "border-[#D0D5DD] bg-white text-[#475467] hover:bg-[#F9FAFB]")}
                    >
                      {showFiltersCount ? `Filtros (${advancedFiltersCount})` : "Filtros"}
                    </button>
                    <div className="flex items-center gap-2 text-[12px] text-[#667085]">
                      <span>Atualizado {refreshLabel}</span>
                      <button onClick={refreshInboxNow} className="font-semibold text-[#0E9384] hover:text-[#0B7F74]" disabled={isRefreshing}>
                        {isRefreshing ? "Atualizando..." : "Atualizar agora"}
                      </button>
                    </div>
                  </div>

                  {refreshError && <p className="mt-2 text-[12px] font-medium text-[#B42318]">{refreshError}</p>}

                  {filtersOpen && (
                    <div className="mt-3 space-y-2 rounded-lg border border-[#EAECF0] bg-white p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[12px] font-medium text-[#667085]">Severidade</p>
                        {allStatuses.map((status) => (
                          <button
                            key={status}
                            onClick={() => setInboxFilters((prev) => ({ ...prev, severities: toggleInArray(prev.severities, status) }))}
                            className={cn(
                              "h-7 rounded-full border px-3 text-[11px] font-medium",
                              activeSeverities.includes(status)
                                ? "border-[#0E9384] bg-[#ECFDF3] text-[#0E9384]"
                                : "border-[#EAECF0] bg-white text-[#667085] hover:bg-[#F9FAFB]",
                            )}
                          >
                            {status}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[12px] font-medium text-[#667085]">Pilar</p>
                        {allPillars.map((pillar) => (
                          <button
                            key={pillar}
                            onClick={() => setInboxFilters((prev) => ({ ...prev, pillars: toggleInArray(prev.pillars, pillar) }))}
                            className={cn(
                              "h-7 rounded-full border px-3 text-[11px] font-medium",
                              activePillars.includes(pillar)
                                ? "border-[#0E9384] bg-[#ECFDF3] text-[#0E9384]"
                                : "border-[#EAECF0] bg-white text-[#667085] hover:bg-[#F9FAFB]",
                            )}
                          >
                            {pillar}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[12px] font-medium text-[#667085]">Fonte</p>
                        {allSources.map((source) => (
                          <button
                            key={source}
                            onClick={() => setInboxFilters((prev) => ({ ...prev, sources: toggleInArray(prev.sources, source) }))}
                            className={cn(
                              "h-7 rounded-full border px-3 text-[11px] font-medium",
                              activeSources.includes(source)
                                ? "border-[#0E9384] bg-[#ECFDF3] text-[#0E9384]"
                                : "border-[#EAECF0] bg-white text-[#667085] hover:bg-[#F9FAFB]",
                            )}
                          >
                            {source}
                          </button>
                        ))}
                      </div>

                      <div className="flex justify-end">
                        <button onClick={clearInboxFilters} className="text-[12px] font-semibold text-[#0E9384] hover:text-[#0B7F74]">
                          Limpar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-2 px-4 pb-4">
                <div className={cn("rounded-xl border px-3 py-2", isDarkMode ? "border-[#374151] bg-[#111827]" : "border-[#E4E7EC] bg-[#F8FAFC]")}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[12px] font-semibold text-[#101828]">Mostrando {inboxRows.length} atualizações</p>
                    {summaryParts.map((part) => (
                      <span key={part} className="inline-flex h-[22px] items-center rounded-full border border-[#E4E7EC] bg-white px-2 text-[11px] text-[#475467]">
                        {part}
                      </span>
                    ))}
                    {hasAnyFilterOverride && (
                      <button onClick={clearInboxFilters} className="ml-auto text-[12px] font-semibold text-[#0E9384] hover:text-[#0B7F74]">
                        Limpar filtros
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Badge className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] text-rose-700">Risco {severityCount.risk}</Badge>
                  <Badge className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] text-amber-700">Atenção {severityCount.attention}</Badge>
                  <Badge className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] text-emerald-700">Saudável {severityCount.healthy}</Badge>
                </div>

                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="h-16 animate-pulse rounded-xl border border-[#EAECF0] bg-[#F8FAFC]" />
                    ))}
                  </div>
                ) : inboxError ? (
                  <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-4">
                    <p className="text-[14px] font-medium text-[#B42318]">Não foi possível carregar atualizações.</p>
                    <button onClick={() => setInboxError(false)} className="mt-2 text-[12px] font-medium text-[#B42318] underline">
                      Tentar novamente
                    </button>
                  </div>
                ) : inboxRows.length === 0 ? (
                  <div className="rounded-xl border border-[#EAECF0] bg-[#F8FAFC] px-3 py-4">
                    <p className="text-[14px] text-[#667085]">Nenhuma atualização relevante no período.</p>
                    <button
                      onClick={() => setInboxFilters((prev) => ({ ...prev, period: "7d" }))}
                      className="mt-2 text-[12px] font-medium text-[#0E9384] hover:text-[#0B7F74]"
                    >
                      Ampliar para 7 dias
                    </button>
                  </div>
                ) : (
                  inboxRows.map((item) => {
                    const isNew = (newBadgeUntil[item.id] ?? 0) > Date.now();
                    return (
                      <button
                        key={item.id}
                        onClick={() => openInboxItem(item)}
                        className={cn(
                          "w-full cursor-pointer rounded-xl border border-transparent p-3 text-left transition hover:border-[#D0D5DD] hover:bg-[#F2F4F7] hover:shadow-[inset_3px_0_0_#0E9384]",
                          isNew && "border-[#B2DDFF] bg-[#F0F9FF]",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-2.5">
                            <Avatar className="h-8 w-8 rounded-md">
                              <AvatarImage src={logoByTicker[item.ticker]} alt={item.ticker} className="object-cover" />
                              <AvatarFallback className="rounded-md text-[10px]">{item.ticker.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-semibold text-[#344054]">
                                {item.ticker} - {item.companyName}
                              </p>
                              <p className="truncate text-[14px] font-medium text-[#101828]">{item.title}</p>
                              <p className="mt-1 line-clamp-1 text-[12px] text-[#667085]">Por que importa: {item.whyItMatters}</p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {item.pillarKey && (
                                  <span className="inline-flex h-[22px] items-center rounded-full border border-[#E4E7EC] bg-[#F9FAFB] px-2 text-[11px] text-[#475467]">
                                    {item.pillarKey}
                                  </span>
                                )}
                                {item.source && (
                                  <span className="inline-flex h-[22px] items-center rounded-full border border-[#E4E7EC] bg-[#F9FAFB] px-2 text-[11px] text-[#475467]">
                                    {item.source}
                                  </span>
                                )}
                                <span className="inline-flex h-[22px] items-center rounded-full border border-[#E4E7EC] bg-[#F9FAFB] px-2 text-[11px] text-[#475467]">
                                  {item.relativeTime}
                                </span>
                                {isNew && <span className="inline-flex h-[22px] items-center rounded-full border border-sky-300 bg-sky-100 px-2 text-[11px] font-semibold text-sky-900">Novo</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 flex-col items-end gap-2">
                            <StatusBadge status={item.severity} />
                            <div className="flex items-center gap-1.5">
                              <span className="text-[12px] font-semibold text-[#0E9384]">Abrir análise</span>
                              <ChevronRight className="h-4 w-4 text-[#98A2B3]" />
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card className={cn("rounded-2xl border", isDarkMode ? "border-[#1F2937] bg-[#0F172A]" : "border-[#EAECF0] bg-white")}>
              <CardHeader className="px-4 pt-4">
                <CardTitle className={cn("text-[16px] font-semibold", isDarkMode ? "text-[#F3F4F6]" : "text-[#101828]")}>Pilares em movimento</CardTitle>
                <CardDescription className={cn("text-[14px]", isDarkMode ? "text-[#9CA3AF]" : "text-[#667085]")}>Onde sua watchlist mais mexeu (clique para filtrar a Inbox).</CardDescription>
              </CardHeader>

              <CardContent className="space-y-1 px-4">
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div key={item} className="h-12 animate-pulse rounded-xl border border-[#EAECF0] bg-[#F8FAFC]" />
                    ))}
                  </div>
                ) : (
                  pillarMovements.map((item, idx) => (
                    <button
                      key={item.pillar}
                      onClick={() => applySinglePillarFilter(item.pillar)}
                      className={cn(
                        "w-full cursor-pointer rounded-xl border border-transparent p-3 text-left transition hover:border-[#D0D5DD] hover:bg-[#F8FAFC]",
                        idx > 0 && "border-t border-t-[#F2F4F7]",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[14px] font-medium text-[#101828]">{item.pillar}</p>
                            <span className="text-[12px] text-[#667085]">{item.events} eventos</span>
                            <span className={cn("text-[12px] font-medium", item.trendUp ? "text-emerald-600" : "text-rose-600")}>{item.trendLabel}</span>
                          </div>
                          <div className="mt-2">
                            <SegmentedHealthBar healthy={item.healthy} attention={item.attention} risk={item.risk} />
                            <div className="mt-1 flex items-center gap-3 text-[10px]">
                              <span className="text-rose-600">Risco {item.risk}</span>
                              <span className="text-amber-600">Atenção {item.attention}</span>
                              <span className="text-emerald-600">Saudável {item.healthy}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[#98A2B3]" />
                      </div>
                    </button>
                  ))
                )}
              </CardContent>

              <CardFooter className="justify-between border-t border-[#F2F4F7] px-4 pt-3 pb-4">
                <div>
                  <p className="text-[12px] text-[#667085]">Atualizado {refreshLabel} • CVM / B3 / RI</p>
                  {sourceFailed && <p className="text-[12px] text-amber-700">1 fonte falhou hoje; tentaremos novamente.</p>}
                </div>
                <button onClick={() => applySinglePillarFilter(focusedPillar)} className="text-[12px] font-medium text-[#0E9384] hover:text-[#0B7F74]">
                  Ver empresas afetadas
                </button>
              </CardFooter>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
