"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, SlidersHorizontal, X, Check } from "lucide-react";
import { useData, type FilterDim } from "./data-provider";
import { GENDER_LABEL, titleCase } from "@/lib/format";

const DIM_LABELS: Record<FilterDim, string> = {
  marca: "Marca",
  mes: "Mês",
  age: "Idade",
  gender: "Gênero",
  format: "Formato",
  region: "Praça",
};

function displayValue(dim: FilterDim, v: string) {
  if (dim === "gender") return GENDER_LABEL[v] ?? v;
  if (dim === "mes") return titleCase(v);
  return v;
}

function Dropdown({ dim }: { dim: FilterDim }) {
  const { options, filters, toggleFilter } = useData();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const opts = options[dim];
  const selected = filters[dim];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (opts.length <= 1) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
          selected.length
            ? "border-ism-green/30 bg-ism-green/10 text-ism-green-700"
            : "border-ism-green/15 bg-white text-ism-green-900/70 hover:border-ism-green/30"
        }`}
      >
        {DIM_LABELS[dim]}
        {selected.length > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-ism-green px-1 text-[10px] font-bold text-white">
            {selected.length}
          </span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 max-h-72 w-52 overflow-y-auto rounded-2xl border border-ism-green/10 bg-white p-1.5 shadow-float">
          {opts.map((o) => {
            const on = selected.includes(o);
            return (
              <button
                key={o}
                onClick={() => toggleFilter(dim, o)}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm text-ism-green-900/80 hover:bg-ism-green/[0.06]"
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-md border ${
                    on ? "border-ism-green bg-ism-green text-white" : "border-ism-green/25"
                  }`}
                >
                  {on && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                <span className="truncate">{displayValue(dim, o)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function FilterBar() {
  const { activeFilterCount, clearFilters, rows, dataset } = useData();
  const dims: FilterDim[] = ["marca", "mes", "region", "format"];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 flex items-center gap-1.5 text-sm font-medium text-ism-green-900/55">
        <SlidersHorizontal className="h-4 w-4" />
        Filtros
      </span>
      {dims.map((d) => (
        <Dropdown key={d} dim={d} />
      ))}
      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 rounded-full bg-ism-red/10 px-3 py-1.5 text-sm font-medium text-ism-red transition-colors hover:bg-ism-red/15"
        >
          <X className="h-3.5 w-3.5" />
          Limpar ({activeFilterCount})
        </button>
      )}
      <span className="ml-auto text-xs text-ism-green-900/40">
        {rows.length.toLocaleString("pt-BR")} de{" "}
        {dataset.rows.length.toLocaleString("pt-BR")} registros
      </span>
    </div>
  );
}
