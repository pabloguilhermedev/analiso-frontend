import {
  Bell,
  Compass,
  FileText,
  GitCompare,
  HelpCircle,
  LayoutDashboard,
  Settings,
  Star,
  TrendingUp,
  UserCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../assets/logos/logo.png";

interface SidebarProps {
  currentPage?: string;
}

export function Sidebar({ currentPage = "dashboard" }: SidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { id: "explorar", label: "Explorar", icon: Compass, href: "/explorar" },
    { id: "watchlist", label: "Watchlist", icon: TrendingUp, href: "/watchlist", count: 12 },
    { id: "comparar", label: "Comparar", icon: GitCompare, href: "/comparar" },
  ];

  const toolItems = [
    { id: "alertas", label: "Alertas", icon: Bell, href: "#", count: 8 },
    { id: "relatorios", label: "Relatórios", icon: FileText, href: "#" },
  ];

  const supportItems = [
    { id: "configuracoes", label: "Configurações", icon: Settings, href: "#" },
    { id: "ajuda", label: "Ajuda", icon: HelpCircle, href: "#" },
  ];

  const favorites = [
    { ticker: "WEGE3", href: "/empresa/WEGE3" },
    { ticker: "VALE3", href: "/empresa/VALE3" },
    { ticker: "ITUB4", href: "/empresa/ITUB4" },
  ];

  const renderItems = (items: Array<{ id: string; label: string; icon: any; href: string; count?: number }>) =>
    items.map((item) => {
      const Icon = item.icon;
      const isActive = currentPage === item.id;
      const baseClass = `w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors ${
        isActive ? "bg-[#F2F4F7] text-[#0B1220]" : "text-[#475467] hover:bg-[#F8FAFC] hover:text-[#0B1220]"
      }`;

      const content = (
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4" />
          <span>{item.label}</span>
        </div>
      );

      return item.href.startsWith("/") ? (
        <Link key={item.id} to={item.href} className={baseClass}>
          {content}
          {item.count ? (
            <span className="rounded-full border border-[#EAECF0] px-2 py-0.5 text-[10px] text-[#667085]">
              {item.count}
            </span>
          ) : null}
        </Link>
      ) : (
        <button key={item.id} className={baseClass}>
          {content}
          {item.count ? (
            <span className="rounded-full border border-[#EAECF0] px-2 py-0.5 text-[10px] text-[#667085]">
              {item.count}
            </span>
          ) : null}
        </button>
      );
    });

  return (
    <aside className="dash-side fixed left-0 top-0 z-30 h-screen w-[240px] border-r border-[#EAECF0] bg-white">
      <div className="flex h-full flex-col">
        <div className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#EAECF0] bg-white">
              <img src={logo} alt="Logo da empresa" className="h-7 w-7 object-contain" />
            </div>
            <div className="flex items-center">
              <p className="text-base font-semibold text-[#0B1220]">Analiso</p>
            </div>
          </div>
        </div>

        <nav className="px-3 py-1">
          <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">Geral</p>
          <div className="space-y-1">{renderItems(navItems)}</div>
        </nav>

        <div className="px-3 pt-4">
          <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">Ferramentas</p>
          <div className="space-y-1">{renderItems(toolItems)}</div>
        </div>

        <div className="px-3 pt-4">
          <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">Favoritos</p>
          <div className="space-y-1">
            {favorites.map((item) => (
              <Link
                key={item.ticker}
                to={item.href}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-[#475467] hover:bg-[#F8FAFC] hover:text-[#0B1220]"
              >
                <span>{item.ticker}</span>
                <Star className="h-3.5 w-3.5 text-amber-500" />
              </Link>
            ))}
          </div>
        </div>

        <div className="px-3 pt-4">
          <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[#98A2B3]">Suporte</p>
          <div className="space-y-1">{renderItems(supportItems)}</div>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-[#EAECF0] bg-[#F8FAFC] p-4">
            <p className="text-xs font-semibold text-[#0B1220]">Upgrade para PRO</p>
            <p className="mt-1 text-[11px] text-[#667085]">
              Não perca recursos avançados quando seu trial terminar.
            </p>
            <button className="mt-3 w-full rounded-xl bg-[#0E9384] px-3 py-2 text-xs font-semibold text-white hover:opacity-90">
              Upgrade agora
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
