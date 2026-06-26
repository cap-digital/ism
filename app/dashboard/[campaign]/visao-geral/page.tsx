"use client";

import { useMemo } from "react";
import {
  DollarSign,
  Users2,
  Eye,
  MousePointerClick,
  Heart,
  Repeat,
} from "lucide-react";
import { useData } from "@/components/data-provider";
import { PageGate } from "@/components/states";
import { KpiCard } from "@/components/ui/kpi-card";
import { ChartCard, EmptyState } from "@/components/ui/card";
import { DonutChart } from "@/components/charts/donut";
import { HorizontalBar } from "@/components/charts/bars";
import { TrendChart } from "@/components/charts/trend";
import {
  accumulate,
  ctr,
  frequency,
  engRate,
  cpm,
  groupBy,
} from "@/lib/aggregate";
import {
  BRAND_COLORS,
  GENDER_COLORS,
  ISM,
  PALETTE,
} from "@/lib/constants";
import {
  fmtCompact,
  fmtCurrency,
  fmtInt,
  fmtPct,
  fmtDecimal,
  monthRank,
  titleCase,
  GENDER_LABEL,
} from "@/lib/format";

export default function VisaoGeralPage() {
  return (
    <PageGate>
      <Content />
    </PageGate>
  );
}

function Content() {
  const { rows } = useData();
  const t = useMemo(() => accumulate(rows), [rows]);

  const trend = useMemo(() => {
    const g = groupBy(rows, (r) => r.date).filter((b) => b.key && b.key !== "—");
    return g
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((b) => {
        const [, m, d] = b.key.split("-");
        return {
          name: `${d}/${m}`,
          investimento: Math.round(b.totals.investimento),
          reach: b.totals.reach,
          impressions: b.totals.impressions,
        };
      });
  }, [rows]);

  const brandData = useMemo(
    () =>
      groupBy(rows, (r) => r.marca)
        .map((b) => ({
          name: b.key,
          value: b.totals.investimento,
          color: BRAND_COLORS[b.key] ?? ISM.green,
        }))
        .sort((a, b) => b.value - a.value),
    [rows],
  );

  const genderData = useMemo(
    () =>
      groupBy(rows, (r) => r.gender)
        .map((b) => ({
          name: GENDER_LABEL[b.key] ?? b.key,
          value: b.totals.reach,
          color: GENDER_COLORS[b.key] ?? ISM.green,
        }))
        .sort((a, b) => b.value - a.value),
    [rows],
  );

  const topPracas = useMemo(
    () =>
      groupBy(rows, (r) => r.praca)
        .map((b) => ({ name: b.key, value: b.totals.reach }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 7),
    [rows],
  );

  const monthData = useMemo(() => {
    const g = groupBy(rows, (r) => r.mes).filter((b) => b.key && b.key !== "—");
    return g
      .sort((a, b) => monthRank(a.key) - monthRank(b.key))
      .map((b) => ({
        name: titleCase(b.key),
        value: b.totals.investimento,
        color: PALETTE[0],
      }));
  }, [rows]);

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Investimento" value={fmtCurrency(t.investimento)} icon={DollarSign} accent="green" sub={`${fmtInt(t.rows)} registros`} />
        <KpiCard label="Alcance" value={fmtCompact(t.reach)} icon={Users2} accent="green" sub="pessoas únicas" />
        <KpiCard label="Impressões" value={fmtCompact(t.impressions)} icon={Eye} accent="gold" sub={`Freq. ${fmtDecimal(frequency(t))}`} />
        <KpiCard label="Engajamento" value={fmtCompact(t.engagement)} icon={Heart} accent="gold" sub={`Taxa ${fmtPct(engRate(t))}`} />
        <KpiCard label="Cliques" value={fmtInt(t.clicks)} icon={MousePointerClick} accent="green" sub={`CTR ${fmtPct(ctr(t))}`} />
        <KpiCard label="CPM" value={fmtCurrency(cpm(t))} icon={Repeat} accent="red" sub="custo por mil impr." />
      </div>

      {/* trend + brand */}
      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          title="Evolução diária"
          subtitle="Investimento e alcance ao longo do período"
          className="xl:col-span-2"
        >
          {trend.length ? (
            <TrendChart
              data={trend}
              height={300}
              series={[
                { key: "reach", name: "Alcance", color: ISM.green, type: "area", format: fmtCompact },
                { key: "investimento", name: "Investimento", color: ISM.gold, type: "line", format: fmtCurrency },
              ]}
            />
          ) : (
            <EmptyState />
          )}
        </ChartCard>

        <ChartCard title="Investimento por marca" subtitle="Distribuição do investimento">
          {brandData.length ? (
            <DonutChart
              data={brandData}
              format={fmtCurrency}
              centerValue={fmtCompact(t.investimento)}
              centerLabel="total"
            />
          ) : (
            <EmptyState />
          )}
        </ChartCard>
      </div>

      {/* bottom row */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <ChartCard title="Top praças por alcance" subtitle="7 maiores localidades" className="xl:col-span-2">
          {topPracas.length ? (
            <HorizontalBar data={topPracas} format={fmtCompact} colored />
          ) : (
            <EmptyState />
          )}
        </ChartCard>

        <ChartCard title="Alcance por gênero" subtitle="Distribuição demográfica">
          {genderData.length ? (
            <DonutChart data={genderData} format={fmtCompact} centerValue={fmtCompact(t.reach)} centerLabel="alcance" />
          ) : (
            <EmptyState />
          )}
        </ChartCard>
      </div>

      {monthData.length > 1 && (
        <ChartCard title="Investimento por mês" subtitle="Sazonalidade do gasto">
          <HorizontalBar data={monthData} format={fmtCurrency} />
        </ChartCard>
      )}
    </div>
  );
}
