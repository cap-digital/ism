"use client";

import { usePathname } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { NAV } from "@/lib/nav";
import { CAMPAIGNS } from "@/lib/constants";
import { useData } from "./data-provider";
import { FilterBar } from "./filter-bar";

export function Topbar() {
  const pathname = usePathname();
  const { type, loading, updatedAt } = useData();
  const current = NAV.find((n) => pathname.endsWith(`/${n.slug}`));
  const meta = CAMPAIGNS[type];

  const updated = updatedAt
    ? new Date(updatedAt).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <header className="sticky top-0 z-20 -mx-4 mb-5 border-b border-ism-green/10 bg-[#f3f7f4]/85 px-4 pb-3 pt-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="pl-12 lg:pl-0">
          <div className="flex items-center gap-2 text-xs font-medium text-ism-green-900/45">
            <span className="rounded-full bg-ism-green/10 px-2 py-0.5 text-ism-green-700">
              {meta.name}
            </span>
            <span>/</span>
            <span>{current?.label ?? "Dashboard"}</span>
          </div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-ism-green-900 sm:text-2xl">
            {current?.label ?? "Dashboard"}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-ism-green-900/45">
          {loading ? (
            <span className="flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> carregando…
            </span>
          ) : (
            updated && <span>Atualizado {updated}</span>
          )}
        </div>
      </div>
      <div className="mt-3">
        <FilterBar />
      </div>
    </header>
  );
}
