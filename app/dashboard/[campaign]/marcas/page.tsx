"use client";

import { useMemo } from "react";
import { Tag } from "lucide-react";
import { useData } from "@/components/data-provider";
import { PageGate } from "@/components/states";
import { ChartCard, Card, EmptyState } from "@/components/ui/card";
import { DonutChart } from "@/components/charts/donut";
import { GroupedBar } from "@/components/charts/grouped-bars";
import {
  groupBy,
  ctr,
  cpm,
  cpe,
  frequency,
  engRate,
} from "@/lib/aggregate";
import { BRAND_COLORS, ISM, PALETTE } from "@/lib/constants";
import {
  fmtCompact,
  fmtCurrency,
  fmtPct,
  fmtDecimal,
  monthRank,
  titleCase,
} from "@/lib/format";

export default function MarcasPage() {
  return (
    <PageGate>
      <Content />
    </PageGate>
  );
}

function Content() {
  const { rows } = useData();

  const brands = useMemo(
    () => groupBy(rows, (r) => r.marca).sort((a, b) => b.totals.investimento - a.totals.investimento),
    [rows],
  );

  const shareDonut = useMemo(
    () =>
      brands.map((b) => ({
        name: b.key,
        value: b.totals.investimento,
        color: BRAND_COLORS[b.key] ?? ISM.green,
      })),
    [brands],
  );

  const reachImpr = useMemo(
    () =>
      brands.map((b) => ({
        name: b.key,
        Alcance: b.totals.reach,
        "Impressões": b.totals.impressions,
      })),
    [brands],
  );

  // brand × month (only meaningful when months exist)
  const monthSeries = useMemo(() => {
    const months = [...new Set(rows.map((r) => r.mes).filter((m) => m && m !== "—"))].sort(
      (a, b) => monthRank(a) - monthRank(b),
    );
    if (months.length < 2) return null;
    const brandKeys = brands.map((b) => b.key);
    const data = months.map((m) => {
      const row: Record<string, string | number> = { name: titleCase(m) };
      for (const bk of brandKeys) row[bk] = 0;
      return row;
    });
    const idx = Object.fromEntries(months.map((m, i) => [m, i]));
    for (const r of rows) {
      if (!r.mes || idx[r.mes] === undefined) continue;
      const row = data[idx[r.mes]];
      row[r.marca] = (row[r.marca] as number) + r.investimento;
    }
    return {
      data,
      series: brandKeys.map((bk, i) => ({
        key: bk,
        name: bk,
        color: BRAND_COLORS[bk] ?? PALETTE[i % PALETTE.length],
      })),
    };
  }, [rows, brands]);

  return (
    <div className="space-y-5">
      {/* per-brand summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((b) => {
          const color = BRAND_COLORS[b.key] ?? ISM.green;
          return (
            <Card key={b.key} className="relative overflow-hidden p-5">
              <span className="absolute right-0 top-0 h-20 w-20 rounded-bl-[40px]" style={{ background: `${color}1a` }} />
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: color }}>
                  <Tag className="h-4 w-4" />
                </span>
                <h3 className="text-lg font-bold text-ism-green-900">{b.key}</h3>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Mini label="Investimento" value={fmtCurrency(b.totals.investimento)} />
                <Mini label="Alcance" value={fmtCompact(b.totals.reach)} />
                <Mini label="CTR" value={fmtPct(ctr(b.totals))} />
                <Mini label="Freq." value={fmtDecimal(frequency(b.totals))} />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Alcance × Impressões por marca" subtitle="Barras emparelhadas" className="xl:col-span-2">
          {reachImpr.length ? (
            <GroupedBar
              data={reachImpr}
              format={fmtCompact}
              series={[
                { key: "Alcance", name: "Alcance", color: ISM.green },
                { key: "Impressões", name: "Impressões", color: ISM.gold },
              ]}
            />
          ) : (
            <EmptyState />
          )}
        </ChartCard>

        <ChartCard title="Share de investimento" subtitle="Participação por marca">
          {shareDonut.length ? <DonutChart data={shareDonut} format={fmtCurrency} /> : <EmptyState />}
        </ChartCard>
      </div>

      {monthSeries && (
        <ChartCard title="Investimento por marca ao longo dos meses" subtitle="Barras emparelhadas por mês">
          <GroupedBar data={monthSeries.data} series={monthSeries.series} format={fmtCurrency} />
        </ChartCard>
      )}

      {/* efficiency table */}
      <Card className="overflow-hidden">
        <div className="px-5 pt-5">
          <h3 className="text-[15px] font-semibold text-ism-green-900">Eficiência por marca</h3>
          <p className="mt-0.5 text-xs text-ism-green-900/50">Métricas de custo e engajamento</p>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-y border-ism-green/10 bg-ism-green/[0.03] text-left text-xs uppercase tracking-wide text-ism-green-900/45">
                <th className="py-2.5 pl-5 font-medium">Marca</th>
                <th className="py-2.5 text-right font-medium">CPM</th>
                <th className="py-2.5 text-right font-medium">CTR</th>
                <th className="py-2.5 text-right font-medium">Taxa eng.</th>
                <th className="py-2.5 text-right font-medium">CPE</th>
                <th className="py-2.5 pr-5 text-right font-medium">Frequência</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((b) => (
                <tr key={b.key} className="border-b border-ism-green/5 hover:bg-ism-green/[0.03]">
                  <td className="py-3 pl-5">
                    <span className="inline-flex items-center gap-2 font-semibold text-ism-green-900">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: BRAND_COLORS[b.key] ?? ISM.green }} />
                      {b.key}
                    </span>
                  </td>
                  <Cell>{fmtCurrency(cpm(b.totals))}</Cell>
                  <Cell>{fmtPct(ctr(b.totals))}</Cell>
                  <Cell>{fmtPct(engRate(b.totals))}</Cell>
                  <Cell>{fmtCurrency(cpe(b.totals))}</Cell>
                  <Cell className="pr-5">{fmtDecimal(frequency(b.totals))}</Cell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-ism-green/[0.05] px-3 py-2">
      <div className="text-[10px] font-medium uppercase tracking-wide text-ism-green-900/45">{label}</div>
      <div className="text-base font-semibold text-ism-green-900">{value}</div>
    </div>
  );
}
function Cell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`py-3 text-right font-medium tabular-nums text-ism-green-900/80 ${className}`}>{children}</td>;
}
