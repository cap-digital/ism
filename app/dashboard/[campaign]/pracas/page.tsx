"use client";

import { useMemo, useState } from "react";
import { MapPin, Building2, Store, TrendingUp } from "lucide-react";
import { useData } from "@/components/data-provider";
import { PageGate } from "@/components/states";
import { ChartCard, Card, EmptyState } from "@/components/ui/card";
import { MetricSelect } from "@/components/ui/metric-select";
import { HorizontalBar } from "@/components/charts/bars";
import { DonutChart } from "@/components/charts/donut";
import { TrendChart } from "@/components/charts/trend";
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
  const { rows, type } = useData();
  const [sort, setSort] = useState<MetricKey>("reach");
  const metric = METRICS[sort];

  // Granular point of sale (empreendimento · bairro) — the most useful ranking.
  const pontos = useMemo(
    () =>
      groupBy(rows, (r) => r.ponto).sort(
        (a, b) =>
          (metric.higherBetter ? -1 : 1) *
          (metric.value(a.totals) - metric.value(b.totals)),
      ),
    [rows, metric],
  );

  const bar = useMemo(
    () =>
      pontos
        .slice(0, 10)
        .map((b) => ({ name: b.key.length > 26 ? b.key.slice(0, 25) + "…" : b.key, value: metric.value(b.totals) }))
        .reverse(),
    [pontos, metric],
  );

  const cidadeData = useMemo(
    () =>
      groupBy(rows, (r) => r.praca)
        .map((b, i) => ({ name: b.key, value: metric.value(b.totals), color: PALETTE[i % PALETTE.length] }))
        .sort((a, b) => b.value - a.value),
    [rows, metric],
  );

  const empreendimentoData = useMemo(
    () =>
      groupBy(rows, (r) => r.empreendimento)
        .map((b, i) => ({ name: b.key, value: metric.value(b.totals), color: PALETTE[i % PALETTE.length] }))
        .sort((a, b) => b.value - a.value),
    [rows, metric],
  );

  // Evolução diária por empreendimento — uma linha por rede (na Always ON há
  // apenas "Institucional", virando a série diária da métrica selecionada).
  const empTrend = useMemo(() => {
    const emps = [...new Set(rows.map((r) => r.empreendimento))];
    const m = new Map(
      groupBy(rows, (r) => `${r.date}__${r.empreendimento}`).map((b) => [b.key, b.totals]),
    );
    const dates = [...new Set(rows.map((r) => r.date).filter(Boolean))].sort();
    const data = dates.map((d) => {
      const [, mo, da] = d.split("-");
      const o: Record<string, string | number> = { name: `${da}/${mo}` };
      for (const e of emps) {
        const t = m.get(`${d}__${e}`);
        o[e] = t ? metric.value(t) : 0;
      }
      return o;
    });
    const series = emps.map((e, i) => ({
      key: e,
      name: e,
      color: PALETTE[i % PALETTE.length],
      type: "line" as const,
      format: metric.format,
    }));
    return { data, series };
  }, [rows, metric]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-sm text-ism-green-900/55">
          <MapPin className="h-4 w-4" /> {pontos.length} pontos · {cidadeData.length} praças · ordenar por
        </p>
        <MetricSelect value={sort} onChange={setSort} options={SORT_OPTIONS} />
      </div>

      {type === "alwayson" ? (
        // Always ON não tem redes de loja (tudo é Institucional), então o ranking
        // de "pontos de venda" fica redundante com "praças". Mostramos as praças
        // ao lado da evolução diária por empreendimento.
        <div className="grid gap-4 xl:grid-cols-2">
          <ChartCard
            title={`Praças (cidades) · ${metric.label}`}
            subtitle="Mercados atendidos"
            action={<Building2 className="h-5 w-5 text-ism-green-700/50" />}
          >
            {cidadeData.length ? (
              <HorizontalBar data={[...cidadeData].reverse()} format={metric.format} height={340} colored />
            ) : (
              <EmptyState />
            )}
          </ChartCard>

          <ChartCard
            title="Evolução diária"
            subtitle={`${metric.label} por dia`}
            action={<TrendingUp className="h-5 w-5 text-ism-green-700/50" />}
          >
            {empTrend.data.length ? (
              <TrendChart data={empTrend.data} series={empTrend.series} height={300} />
            ) : (
              <EmptyState />
            )}
          </ChartCard>
        </div>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-3">
            <ChartCard
              title={`Top pontos de venda · ${metric.label}`}
              subtitle="Empreendimento e bairro (10 maiores)"
              className="xl:col-span-2"
            >
              {bar.length ? <HorizontalBar data={bar} format={metric.format} colored /> : <EmptyState />}
            </ChartCard>

            <ChartCard
              title="Por empreendimento"
              subtitle="Redes de loja"
              action={<Store className="h-5 w-5 text-ism-green-700/50" />}
            >
              {empreendimentoData.length ? (
                <DonutChart data={empreendimentoData} format={metric.format} />
              ) : (
                <EmptyState />
              )}
            </ChartCard>
          </div>

          <ChartCard
            title={`Praças (cidades) · ${metric.label}`}
            subtitle="Mercados atendidos"
            action={<Building2 className="h-5 w-5 text-ism-green-700/50" />}
          >
            {cidadeData.length ? (
              <HorizontalBar data={[...cidadeData].reverse()} format={metric.format} colored />
            ) : (
              <EmptyState />
            )}
          </ChartCard>
        </>
      )}

      <Card className="overflow-hidden">
        <div className="px-5 pt-5">
          <h3 className="text-[15px] font-semibold text-ism-green-900">Detalhamento por ponto de venda</h3>
          <p className="mt-0.5 text-xs text-ism-green-900/50">Ordenado por {metric.label.toLowerCase()}</p>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-y border-ism-green/10 bg-ism-green/[0.03] text-left text-xs uppercase tracking-wide text-ism-green-900/45">
                <Th className="pl-5">Ponto de venda</Th>
                <Th right>Alcance</Th>
                <Th right>Impressões</Th>
                <Th right>Invest.</Th>
                <Th right>CTR</Th>
                <Th right>Eng.</Th>
                <Th right className="pr-5">CPM</Th>
              </tr>
            </thead>
            <tbody>
              {pontos.map((b: GroupBucket, i) => (
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
