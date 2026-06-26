"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ApiPayload, CampaignType, Dataset, Row } from "@/lib/types";
import { monthRank } from "@/lib/format";

export type FilterDim = "marca" | "mes" | "age" | "gender" | "format" | "region";

export type Filters = Record<FilterDim, string[]>;

const EMPTY_FILTERS: Filters = {
  marca: [],
  mes: [],
  age: [],
  gender: [],
  format: [],
  region: [],
};

interface Ctx {
  loading: boolean;
  error: string | null;
  type: CampaignType;
  dataset: Dataset; // raw (unfiltered) dataset for current type
  rows: Row[]; // filtered rows
  filters: Filters;
  toggleFilter: (dim: FilterDim, value: string) => void;
  clearFilters: () => void;
  activeFilterCount: number;
  options: Record<FilterDim, string[]>;
  updatedAt: string | null;
}

const DataCtx = createContext<Ctx | null>(null);

// module-level cache so navigation between pages/campaigns never refetches
let payloadCache: ApiPayload | null = null;
let inflight: Promise<ApiPayload> | null = null;

async function loadPayload(): Promise<ApiPayload> {
  if (payloadCache) return payloadCache;
  if (!inflight) {
    inflight = fetch("/api/dataset")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d: ApiPayload) => {
        if (!("alwayson" in d)) throw new Error("Resposta inválida");
        payloadCache = d;
        return d;
      })
      .catch((e) => {
        inflight = null;
        throw e;
      });
  }
  return inflight;
}

const EMPTY_DATASET = (type: CampaignType): Dataset => ({
  type,
  rows: [],
  thumbs: [],
  perms: [],
  updatedAt: "",
});

function uniqSorted(rows: Row[], get: (r: Row) => string, sort?: (a: string, b: string) => number) {
  const s = new Set<string>();
  for (const r of rows) {
    const v = get(r);
    if (v) s.add(v);
  }
  return [...s].sort(sort);
}

export function DataProvider({
  type,
  children,
}: {
  type: CampaignType;
  children: ReactNode;
}) {
  const [payload, setPayload] = useState<ApiPayload | null>(payloadCache);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  useEffect(() => {
    let on = true;
    if (!payloadCache) {
      loadPayload()
        .then((d) => on && setPayload(d))
        .catch((e) => on && setError(e.message));
    }
    return () => {
      on = false;
    };
  }, []);

  // reset filters when switching campaign type
  useEffect(() => {
    setFilters(EMPTY_FILTERS);
  }, [type]);

  const dataset = payload ? payload[type] : EMPTY_DATASET(type);

  const options = useMemo<Record<FilterDim, string[]>>(() => {
    const rows = dataset.rows;
    return {
      marca: uniqSorted(rows, (r) => r.marca),
      mes: uniqSorted(rows, (r) => r.mes, (a, b) => monthRank(a) - monthRank(b)),
      age: uniqSorted(rows, (r) => r.age, (a, b) => a.localeCompare(b)),
      gender: uniqSorted(rows, (r) => r.gender),
      format: uniqSorted(rows, (r) => r.format),
      region: uniqSorted(rows, (r) => r.region),
    };
  }, [dataset]);

  const rows = useMemo(() => {
    const f = filters;
    const has = (dim: FilterDim) => f[dim].length > 0;
    const active = (Object.keys(f) as FilterDim[]).filter(has);
    if (active.length === 0) return dataset.rows;
    return dataset.rows.filter((r) =>
      active.every((dim) => f[dim].includes(r[dim])),
    );
  }, [dataset, filters]);

  const toggleFilter = (dim: FilterDim, value: string) => {
    setFilters((prev) => {
      const cur = prev[dim];
      const next = cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value];
      return { ...prev, [dim]: next };
    });
  };

  const clearFilters = () => setFilters(EMPTY_FILTERS);

  const activeFilterCount = useMemo(
    () =>
      (Object.values(filters) as string[][]).reduce(
        (n, arr) => n + arr.length,
        0,
      ),
    [filters],
  );

  const value: Ctx = {
    loading: !payload && !error,
    error,
    type,
    dataset,
    rows,
    filters,
    toggleFilter,
    clearFilters,
    activeFilterCount,
    options,
    updatedAt: payload?.[type]?.updatedAt ?? null,
  };

  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
}

export function useData(): Ctx {
  const ctx = useContext(DataCtx);
  if (!ctx) throw new Error("useData deve ser usado dentro de DataProvider");
  return ctx;
}
