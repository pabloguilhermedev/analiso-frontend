import {
  Bookmark,
  Building2,
  CalendarDays,
  Compass,
  GitCompare,
  Home,
  LayoutGrid,
  NotebookPen,
  UserCircle2,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../assets/logos/logo.png";

interface SidebarProps {
  currentPage?: string;
}

type SidebarItem = {
  id: string;
  label: string;
  href: string;
  icon: any;
};

export function Sidebar({ currentPage = "dashboard" }: SidebarProps) {
  const primaryItems: SidebarItem[] = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
    { id: "explorar", label: "Explorar", icon: Compass, href: "/explorar" },
    { id: "watchlist", label: "Watchlist", icon: LayoutGrid, href: "/watchlist" },
    { id: "comparar", label: "Comparar", icon: GitCompare, href: "/comparar" },
  ];

  const secondaryItems: SidebarItem[] = [
    { id: "agenda", label: "Agenda", icon: CalendarDays, href: "#" },
    { id: "notas", label: "Notas", icon: NotebookPen, href: "#" },
    { id: "empresas", label: "Empresas", icon: Building2, href: "#" },
    { id: "time", label: "Time", icon: Users, href: "#" },
    { id: "bookmarks", label: "Bookmarks", icon: Bookmark, href: "#" },
  ];

  const renderItems = (items: SidebarItem[]) =>
    items.map((item) => {
      const Icon = item.icon;
      const isActive = currentPage === item.id;
      const className = `group relative grid h-11 w-11 place-items-center rounded-full border transition-colors ${
        isActive
          ? "border-[#0E9384] bg-[#0E9384] text-white shadow-[0_8px_18px_rgba(14,147,132,0.28)]"
          : "border-transparent text-[#9CA3AF] hover:border-[#99F6E4] hover:bg-[#E9F8F5] hover:text-[#0E9384]"
      }`;

      if (item.href.startsWith("/")) {
        return (
          <Link key={item.id} to={item.href} className={className} title={item.label} aria-label={item.label}>
            <Icon className="h-[18px] w-[18px]" />
            {isActive ? <span className="pointer-events-none absolute -right-[22px] h-2 w-2 rounded-full bg-[#D5EAFF]" /> : null}
          </Link>
        );
      }

      return (
        <button key={item.id} className={className} title={item.label} aria-label={item.label}>
          <Icon className="h-[18px] w-[18px]" />
        </button>
      );
    });

  return (
    <aside className="dash-side fixed left-0 top-0 z-30 h-screen w-[88px] border-r border-[#E5E7EB] bg-[#F5F5F5]">
      <div className="flex h-full flex-col items-center px-3 py-4">
        <img src={logo} alt="Analiso" className="h-11 w-11 object-contain" />

        <nav className="mt-5 flex w-full flex-col items-center gap-3">
          {renderItems(primaryItems)}
        </nav>

        <div className="my-4 h-px w-12 border-t border-dashed border-[#D9B97F]" />

        <nav className="flex w-full flex-col items-center gap-3">
          {renderItems(secondaryItems)}
        </nav>

        <div className="my-4 h-px w-12 border-t border-dashed border-[#8DC4A3]" />

        <div className="mt-auto">
          <button
            title="Perfil"
            aria-label="Perfil"
            className="grid h-10 w-10 place-items-center rounded-full border border-[#D1D5DB] bg-white text-[#9CA3AF] shadow-sm hover:text-[#0E9384]"
          >
            <UserCircle2 className="h-6 w-6" />
          </button>
        </div>
      </div>
    </aside>
  );
}
