"use client";

import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { useData } from "@/components/data-provider";
import { PageGate } from "@/components/states";
import { ChartCard, Card, EmptyState } from "@/components/ui/card";
import { MetricSelect } from "@/components/ui/metric-select";
import { HorizontalBar } from "@/components/charts/bars";
import { DonutChart } from "@/components/charts/donut";
import {
  groupBy,
  ctr,
  cpm,
  engRate,
  METRICS,
  type MetricKey,
  type GroupBucket,
} from "@/lib/aggregate";
import { PALETTE } from "@/lib/constants";
import { fmtCompact, fmtCurrency, fmtPct } from "@/lib/format";

const SORT_OPTIONS: MetricKey[] = ["reach", "investimento", "impressions", "engagement", "ctr", "cpm"];

export default function PracasPage() {
  return (
    <PageGate>
      <Content />
    </PageGate>
  );
}

function Content() {
  const { rows } = useData();
  const [sort, setSort] = useState<MetricKey>("reach");
  const metric = METRICS[sort];

  const pracas = useMemo(
    () =>
      groupBy(rows, (r) => r.praca).sort(
        (a, b) =>
          (metric.higherBetter ? -1 : 1) *
          (metric.value(a.totals) - metric.value(b.totals)),
      ),
    [rows, metric],
  );

  const bar = useMemo(
    () =>
      pracas
        .slice(0, 10)
        .map((b) => ({ name: b.key.length > 24 ? b.key.slice(0, 23) + "…" : b.key, value: metric.value(b.totals) }))
        .reverse(),
    [pracas, metric],
  );

  const regionDonut = useMemo(
    () =>
      groupBy(rows, (r) => r.region)
        .map((b, i) => ({ name: b.key, value: b.totals.reach, color: PALETTE[i % PALETTE.length] }))
        .sort((a, b) => b.value - a.value),
    [rows],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-sm text-ism-green-900/55">
          <MapPin className="h-4 w-4" /> {pracas.length} praças · ordenar por
        </p>
        <MetricSelect value={sort} onChange={setSort} options={SORT_OPTIONS} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard title={`Top praças · ${metric.label}`} subtitle="10 maiores localidades" className="xl:col-span-2">
          {bar.length ? <HorizontalBar data={bar} format={metric.format} colored /> : <EmptyState />}
        </ChartCard>

        <ChartCard title="Alcance por região" subtitle="Agrupamento macro">
          {regionDonut.length ? <DonutChart data={regionDonut} format={fmtCompact} /> : <EmptyState />}
        </ChartCard>
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 pt-5">
          <h3 className="text-[15px] font-semibold text-ism-green-900">Detalhamento por praça</h3>
          <p className="mt-0.5 text-xs text-ism-green-900/50">Ordenado por {metric.label.toLowerCase()}</p>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-y border-ism-green/10 bg-ism-green/[0.03] text-left text-xs uppercase tracking-wide text-ism-green-900/45">
                <Th className="pl-5">Praça</Th>
                <Th right>Alcance</Th>
                <Th right>Impressões</Th>
                <Th right>Invest.</Th>
                <Th right>CTR</Th>
                <Th right>Eng.</Th>
                <Th right className="pr-5">CPM</Th>
              </tr>
            </thead>
            <tbody>
              {pracas.map((b: GroupBucket, i) => (
                <tr key={b.key} className="border-b border-ism-green/5 transition-colors hover:bg-ism-green/[0.03]">
                  <td className="py-2.5 pl-5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-ism-green/10 text-[11px] font-bold text-ism-green-700">
                        {i + 1}
                      </span>
                      <span className="font-medium text-ism-green-900">{b.key}</span>
                    </div>
                  </td>
                  <Td>{fmtCompact(b.totals.reach)}</Td>
                  <Td>{fmtCompact(b.totals.impressions)}</Td>
                  <Td>{fmtCurrency(b.totals.investimento)}</Td>
                  <Td>{fmtPct(ctr(b.totals))}</Td>
                  <Td>{fmtPct(engRate(b.totals))}</Td>
                  <Td className="pr-5">{fmtCurrency(cpm(b.totals))}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Th({ children, right, className = "" }: { children: React.ReactNode; right?: boolean; className?: string }) {
  return <th className={`py-2.5 font-medium ${right ? "text-right" : ""} ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`py-2.5 text-right font-medium tabular-nums text-ism-green-900/80 ${className}`}>{children}</td>;
}
