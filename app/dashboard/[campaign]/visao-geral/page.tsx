"use client";

import { useMemo, useState } from "react";
import {
  DollarSign,
  Users2,
  Eye,
  MousePointerClick,
  Heart,
} from "lucide-react";
import { useData } from "@/components/data-provider";
import { PageGate } from "@/components/states";
import { KpiCard } from "@/components/ui/kpi-card";
import { ChartCard, EmptyState } from "@/components/ui/card";
import { MetricDropdown } from "@/components/ui/metric-dropdown";
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
  METRICS,
  type MetricKey,
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
import { metaInvestimentoMes } from "@/lib/metas";

const GENDER_METRICS: MetricKey[] = ["reach", "investimento", "impressions", "engagement", "clicks"];
const EMPREEND_METRICS: MetricKey[] = ["clicks", "impressions", "reach"];

export default function VisaoGeralPage() {
  return (
    <PageGate>
      <Content />
    </PageGate>
  );
}

function Content() {
  const { rows, type, dataset } = useData();
  const t = useMemo(() => accumulate(rows), [rows]);

  // Progresso de investimento vs. meta do mês (apenas Always ON).
  // Quando nenhum mês está selecionado, usa o mês mais recente disponível (hoje: junho).
  const investProgress = useMemo(() => {
    if (type !== "alwayson") return null;

    const present = [...new Set(rows.map((r) => r.mes).filter(Boolean))];
    const month =
      present.length === 1
        ? present[0]
        : [...new Set(dataset.rows.map((r) => r.mes).filter(Boolean))].sort(
            (a, b) => monthRank(b) - monthRank(a),
          )[0];
    if (!month) return null;

    const goal = metaInvestimentoMes(type, month);
    if (!goal) return null;

    const source = present.includes(month) ? rows : dataset.rows;
    const invested = source.reduce(
      (s, r) => (r.mes === month ? s + r.investimento : s),
      0,
    );

    return {
      pct: Math.min(invested / goal, 1),
      label: `Meta ${titleCase(month)} · ${fmtCurrency(goal)}`,
    };
  }, [rows, dataset, type]);
  const [genderMetric, setGenderMetric] = useState<MetricKey>("reach");
  const gMetric = METRICS[genderMetric];
  const [empMetric, setEmpMetric] = useState<MetricKey>("clicks");
  const eMetric = METRICS[empMetric];

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
          value: gMetric.value(b.totals),
          color: GENDER_COLORS[b.key] ?? ISM.green,
        }))
        .sort((a, b) => b.value - a.value),
    [rows, gMetric],
  );

  const topPracas = useMemo(
    () =>
      groupBy(rows, (r) => r.praca)
        .map((b) => ({ name: b.key, value: b.totals.reach }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 7),
    [rows],
  );

  const topEmpreendimentos = useMemo(
    () =>
      groupBy(rows, (r) => r.empreendimento)
        .map((b) => ({ name: b.key, value: eMetric.value(b.totals) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)
        .reverse(),
    [rows, eMetric],
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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Investimento" value={fmtCurrency(t.investimento)} icon={DollarSign} accent="green" progress={investProgress ?? undefined} />
        <KpiCard label="Alcance" value={fmtCompact(t.reach)} icon={Users2} accent="green" sub={`Freq. ${fmtDecimal(frequency(t))}`} />
        <KpiCard label="Impressões" value={fmtCompact(t.impressions)} icon={Eye} accent="gold" sub={`CPM ${fmtCurrency(cpm(t))}`} />
        <KpiCard label="Engajamento" value={fmtCompact(t.engagement)} icon={Heart} accent="gold" sub={`Taxa ${fmtPct(engRate(t))}`} />
        <KpiCard label="Cliques" value={fmtInt(t.clicks)} icon={MousePointerClick} accent="green" sub={`CTR ${fmtPct(ctr(t))}`} />
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

      {/* bottom row — gender (with metric selector) + location ranking */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* gender donut · ~35% (left) */}
        <ChartCard
          title={`${gMetric.label} por gênero`}
          subtitle="Distribuição demográfica"
          className={type === "geolocalizadas" ? "lg:order-1" : "lg:order-2"}
          action={
            <MetricDropdown value={genderMetric} onChange={setGenderMetric} options={GENDER_METRICS} />
          }
        >
          {genderData.length ? (
            <DonutChart
              data={genderData}
              format={gMetric.format}
              centerValue={fmtCompact(gMetric.value(t))}
              centerLabel={gMetric.short}
            />
          ) : (
            <EmptyState />
          )}
        </ChartCard>

        {/* location ranking · ~65% (right) */}
        {type === "geolocalizadas" ? (
          <ChartCard
            title={`Top empreendimentos · ${eMetric.label}`}
            subtitle="Varejo: Assaí, Atacadão, Atakarejo, Mercantil…"
            className="lg:order-2 lg:col-span-2"
            action={
              <MetricDropdown value={empMetric} onChange={setEmpMetric} options={EMPREEND_METRICS} />
            }
          >
            {topEmpreendimentos.length ? (
              <HorizontalBar data={topEmpreendimentos} format={eMetric.format} colored />
            ) : (
              <EmptyState />
            )}
          </ChartCard>
        ) : (
          <ChartCard
            title="Top praças por alcance"
            subtitle="Maiores cidades / mercados"
            className="lg:order-1 lg:col-span-2"
          >
            {topPracas.length ? (
              <HorizontalBar data={topPracas} format={fmtCompact} colored />
            ) : (
              <EmptyState />
            )}
          </ChartCard>
        )}
      </div>

      {monthData.length > 1 && (
        <ChartCard title="Investimento por mês" subtitle="Sazonalidade do gasto">
          <HorizontalBar data={monthData} format={fmtCurrency} />
        </ChartCard>
      )}
    </div>
  );
}
