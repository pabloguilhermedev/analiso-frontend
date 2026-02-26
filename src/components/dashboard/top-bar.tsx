import { Bell, Search } from "lucide-react";
import { useState } from "react";

type TopBarProps = {
  updatedAt?: string;
};

export function TopBar({}: TopBarProps) {
  const [search, setSearch] = useState("");

  return (
    <header className="dash-top fixed left-0 right-0 top-0 z-20 h-16 border-b border-[#EAECF0] bg-white lg:left-[240px]">
      <div className="flex h-full items-center justify-between gap-4 px-5 lg:px-8">
        <div>
          <p className="text-base font-semibold text-[#0B1220]">Bem-vindo de volta, Pablo!</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden w-full max-w-[420px] md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar empresa ou ticker"
                className="w-full rounded-xl border border-[#EAECF0] bg-white py-2 pl-9 pr-3 text-sm text-[#0B1220] placeholder:text-[#98A2B3] shadow-[0_1px_2px_rgba(16,24,40,0.06)] focus:border-[#CDECE7] focus:outline-none focus:ring-2 focus:ring-[#0E9384]/15"
              />
            </div>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-[#667085] hover:bg-[#F8FAFC] md:hidden">
            <Search className="h-4 w-4" />
          </button>
          <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#EAECF0] text-[#667085] hover:bg-[#F8FAFC]">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
          </button>
          <div className="flex items-center gap-2 rounded-full border border-[#EAECF0] bg-white px-2.5 py-1.5 text-xs text-[#475467] shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E9F8F5] text-[10px] font-semibold text-[#0E9384]">
              PB
            </div>
            <span className="hidden sm:block">Pablo Benevenuto</span>
          </div>
        </div>
      </div>
    </header>
  );
}
