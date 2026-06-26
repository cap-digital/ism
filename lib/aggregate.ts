import type { Row } from "./types";
import { fmtCompact, fmtCurrency, fmtDecimal, fmtInt, fmtPct } from "./format";

export interface Totals {
  rows: number;
  // Monetary value: always "Investimento" (carries an important coefficient).
  // The raw `spend` column is intentionally not used anywhere.
  investimento: number;
  impressions: number;
  clicks: number;
  reach: number;
  engagement: number;
  reactions: number;
  v25: number;
  v50: number;
  v75: number;
  v100: number;
  vtp: number;
}

export function emptyTotals(): Totals {
  return {
    rows: 0,
    investimento: 0,
    impressions: 0,
    clicks: 0,
    reach: 0,
    engagement: 0,
    reactions: 0,
    v25: 0,
    v50: 0,
    v75: 0,
    v100: 0,
    vtp: 0,
  };
}

export function accumulate(rows: Row[]): Totals {
  const t = emptyTotals();
  for (const r of rows) {
    t.rows++;
    t.investimento += r.investimento;
    t.impressions += r.impressions;
    t.clicks += r.clicks;
    t.reach += r.reach;
    t.engagement += r.engagement;
    t.reactions += r.reactions;
    t.v25 += r.v25;
    t.v50 += r.v50;
    t.v75 += r.v75;
    t.v100 += r.v100;
    t.vtp += r.vtp;
  }
  return t;
}

const safeDiv = (a: number, b: number) => (b > 0 ? a / b : 0);

/** Derived rate metrics from a Totals bucket. */
export function ctr(t: Totals) {
  return safeDiv(t.clicks, t.impressions);
}
export function cpm(t: Totals) {
  return safeDiv(t.investimento, t.impressions) * 1000;
}
export function cpc(t: Totals) {
  return safeDiv(t.investimento, t.clicks);
}
export function frequency(t: Totals) {
  return safeDiv(t.impressions, t.reach);
}
export function engRate(t: Totals) {
  return safeDiv(t.engagement, t.reach);
}
export function cpe(t: Totals) {
  return safeDiv(t.investimento, t.engagement);
}
export function cpReach(t: Totals) {
  return safeDiv(t.investimento, t.reach) * 1000;
}
export function hookRate(t: Totals) {
  return safeDiv(t.v25, t.impressions);
}
export function completionRate(t: Totals) {
  return safeDiv(t.v100, t.v25);
}

export type MetricKey =
  | "investimento"
  | "impressions"
  | "reach"
  | "clicks"
  | "engagement"
  | "ctr"
  | "cpm"
  | "cpc"
  | "frequency"
  | "engRate"
  | "cpe"
  | "cpReach"
  | "v100";

export interface MetricDef {
  key: MetricKey;
  label: string;
  short: string;
  /** value extractor from a Totals bucket */
  value: (t: Totals) => number;
  format: (v: number) => string;
  /** for ranking: is a higher value better? */
  higherBetter: boolean;
}

export const METRICS: Record<MetricKey, MetricDef> = {
  investimento: { key: "investimento", label: "Investimento", short: "Invest.", value: (t) => t.investimento, format: fmtCurrency, higherBetter: true },
  impressions: { key: "impressions", label: "Impressões", short: "Impr.", value: (t) => t.impressions, format: fmtCompact, higherBetter: true },
  reach: { key: "reach", label: "Alcance", short: "Alcance", value: (t) => t.reach, format: fmtCompact, higherBetter: true },
  clicks: { key: "clicks", label: "Cliques", short: "Cliques", value: (t) => t.clicks, format: fmtInt, higherBetter: true },
  engagement: { key: "engagement", label: "Engajamento", short: "Engaj.", value: (t) => t.engagement, format: fmtCompact, higherBetter: true },
  ctr: { key: "ctr", label: "CTR", short: "CTR", value: ctr, format: (v) => fmtPct(v, 2), higherBetter: true },
  cpm: { key: "cpm", label: "CPM", short: "CPM", value: cpm, format: fmtCurrency, higherBetter: false },
  cpc: { key: "cpc", label: "CPC", short: "CPC", value: cpc, format: fmtCurrency, higherBetter: false },
  frequency: { key: "frequency", label: "Frequência", short: "Freq.", value: frequency, format: (v) => fmtDecimal(v, 2), higherBetter: false },
  engRate: { key: "engRate", label: "Taxa de engaj.", short: "Eng. %", value: engRate, format: (v) => fmtPct(v, 2), higherBetter: true },
  cpe: { key: "cpe", label: "Custo por engaj.", short: "CPE", value: cpe, format: fmtCurrency, higherBetter: false },
  cpReach: { key: "cpReach", label: "Custo por mil alcance", short: "CPMil alc.", value: cpReach, format: fmtCurrency, higherBetter: false },
  v100: { key: "v100", label: "Views 100%", short: "V100", value: (t) => t.v100, format: fmtCompact, higherBetter: true },
};

export interface GroupBucket {
  key: string;
  totals: Totals;
}

/** Group rows by a dimension accessor and accumulate totals. */
export function groupBy(rows: Row[], accessor: (r: Row) => string): GroupBucket[] {
  const map = new Map<string, Totals>();
  for (const r of rows) {
    const k = accessor(r) || "—";
    let t = map.get(k);
    if (!t) {
      t = emptyTotals();
      map.set(k, t);
    }
    t.rows++;
    t.investimento += r.investimento;
    t.impressions += r.impressions;
    t.clicks += r.clicks;
    t.reach += r.reach;
    t.engagement += r.engagement;
    t.reactions += r.reactions;
    t.v25 += r.v25;
    t.v50 += r.v50;
    t.v75 += r.v75;
    t.v100 += r.v100;
    t.vtp += r.vtp;
  }
  return [...map.entries()].map(([key, totals]) => ({ key, totals }));
}

export function uniqueValues(rows: Row[], accessor: (r: Row) => string): string[] {
  const s = new Set<string>();
  for (const r of rows) {
    const v = accessor(r);
    if (v) s.add(v);
  }
  return [...s];
}
