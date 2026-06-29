"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, SlidersHorizontal, X, Check, CalendarDays } from "lucide-react";
import { useData, type FilterDim } from "./data-provider";
import { titleCase, monthRank } from "@/lib/format";

const DIM_LABELS: Record<FilterDim, string> = {
  marca: "Marca",
  mes: "Mês",
  praca: "Praça",
  empreendimento: "Varejo",
};

function displayValue(dim: FilterDim, v: string) {
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

/** Computes the [from, to] date span of a month name, clamped to data bounds. */
function monthSpan(month: string, bounds: { min: string; max: string }) {
  const rank = monthRank(month);
  if (rank === 99) return null;
  const year = Number((bounds.max || bounds.min || "2026").slice(0, 4));
  const mm = String(rank + 1).padStart(2, "0");
  const lastDay = new Date(year, rank + 1, 0).getDate();
  let from = `${year}-${mm}-01`;
  let to = `${year}-${mm}-${String(lastDay).padStart(2, "0")}`;
  if (bounds.min && from < bounds.min) from = bounds.min;
  if (bounds.max && to > bounds.max) to = bounds.max;
  return { from, to };
}

const ddmm = (iso: string) => (iso ? iso.slice(8, 10) + "/" + iso.slice(5, 7) : "");

function PeriodPicker() {
  const { dateRange, setDateRange, dateBounds, options } = useData();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const months = options.mes;
  const active = Boolean(dateRange.from || dateRange.to);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const label = active
    ? `${ddmm(dateRange.from) || "início"} → ${ddmm(dateRange.to) || "fim"}`
    : "Período";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
          active
            ? "border-ism-green/30 bg-ism-green/10 text-ism-green-700"
            : "border-ism-green/15 bg-white text-ism-green-900/70 hover:border-ism-green/30"
        }`}
      >
        <CalendarDays className="h-4 w-4" />
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-2xl border border-ism-green/10 bg-white p-3 shadow-float">
          {months.length > 0 && (
            <>
              <div className="px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ism-green-900/45">
                Mês
              </div>
              <div className="flex flex-wrap gap-1.5 pb-3">
                {months.map((m) => {
                  const span = monthSpan(m, dateBounds);
                  const on =
                    !!span && dateRange.from === span.from && dateRange.to === span.to;
                  return (
                    <button
                      key={m}
                      onClick={() => span && setDateRange(span)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        on
                          ? "bg-ism-green text-white"
                          : "bg-ism-green/[0.07] text-ism-green-900/70 hover:bg-ism-green/15"
                      }`}
                    >
                      {titleCase(m)}
                    </button>
                  );
                })}
              </div>
              <div className="mb-3 border-t border-ism-green/10" />
            </>
          )}

          <div className="px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ism-green-900/45">
            Intervalo personalizado
          </div>
          <div className="flex items-center gap-2 text-sm">
            <input
              type="date"
              value={dateRange.from}
              min={dateBounds.min}
              max={dateRange.to || dateBounds.max}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-full rounded-xl border border-ism-green/15 px-2 py-1.5 text-ism-green-900/80 outline-none [color-scheme:light] focus:border-ism-green/40"
              aria-label="Data inicial"
            />
            <span className="text-ism-green-900/35">→</span>
            <input
              type="date"
              value={dateRange.to}
              min={dateRange.from || dateBounds.min}
              max={dateBounds.max}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="w-full rounded-xl border border-ism-green/15 px-2 py-1.5 text-ism-green-900/80 outline-none [color-scheme:light] focus:border-ism-green/40"
              aria-label="Data final"
            />
          </div>

          {active && (
            <button
              onClick={() => setDateRange({ from: "", to: "" })}
              className="mt-3 w-full rounded-xl bg-ism-red/10 py-1.5 text-xs font-medium text-ism-red transition-colors hover:bg-ism-red/15"
            >
              Limpar período
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function FilterBar() {
  const { activeFilterCount, clearFilters, rows, dataset } = useData();
  const dims: FilterDim[] = ["marca", "praca", "empreendimento"];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 flex items-center gap-1.5 text-sm font-medium text-ism-green-900/55">
        <SlidersHorizontal className="h-4 w-4" />
        Filtros
      </span>
      {dims.map((d) => (
        <Dropdown key={d} dim={d} />
      ))}
      <PeriodPicker />
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
