"use client";

import { useMemo, useState } from "react";
import { useData } from "@/components/data-provider";
import { PageGate } from "@/components/states";
import { ChartCard, EmptyState } from "@/components/ui/card";
import { MetricSelect } from "@/components/ui/metric-select";
import { DonutChart } from "@/components/charts/donut";
import { HorizontalBar } from "@/components/charts/bars";
import { GroupedBar } from "@/components/charts/grouped-bars";
import { TrendChart } from "@/components/charts/trend";
import { groupBy, METRICS, type MetricKey, type Totals } from "@/lib/aggregate";
import { GENDER_COLORS, ISM } from "@/lib/constants";
import { GENDER_LABEL } from "@/lib/format";

const AGE_ORDER = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+", "Unknown"];
const DEMO_METRICS: MetricKey[] = ["reach", "investimento", "impressions", "engagement", "clicks"];

export default function DemografiaPage() {
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
  const val = (t: Totals | undefined) => (t ? metric.value(t) : 0);

  const ageBars = useMemo(() => {
    const m = new Map(groupBy(rows, (r) => r.age).map((b) => [b.key, b.totals]));
    return AGE_ORDER.filter((a) => m.has(a)).map((a) => ({ name: a, value: val(m.get(a)) }));
  }, [rows, metric]);

  const genderDonut = useMemo(
    () =>
      groupBy(rows, (r) => r.gender)
        .map((b) => ({
          name: GENDER_LABEL[b.key] ?? b.key,
          value: metric.value(b.totals),
          color: GENDER_COLORS[b.key] ?? ISM.green,
        }))
        .sort((a, b) => b.value - a.value),
    [rows, metric],
  );

  const paired = useMemo(() => {
    const m = new Map(groupBy(rows, (r) => `${r.age}__${r.gender}`).map((b) => [b.key, b.totals]));
    return AGE_ORDER.filter((a) =>
      ["female", "male", "unknown"].some((g) => m.has(`${a}__${g}`)),
    ).map((a) => ({
      name: a,
      female: val(m.get(`${a}__female`)),
      male: val(m.get(`${a}__male`)),
    }));
  }, [rows, metric]);

  // Daily evolution split by gender — a line chart that contextualizes the
  // demographic mix over the campaign period.
  const trend = useMemo(() => {
    const m = new Map(groupBy(rows, (r) => `${r.date}__${r.gender}`).map((b) => [b.key, b.totals]));
    const dates = [...new Set(rows.map((r) => r.date).filter(Boolean))].sort();
    return dates.map((d) => {
      const [, mo, da] = d.split("-");
      return {
        name: `${da}/${mo}`,
        female: val(m.get(`${d}__female`)),
        male: val(m.get(`${d}__male`)),
      };
    });
  }, [rows, metric]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ism-green-900/55">Análise demográfica · métrica</p>
        <MetricSelect value={sort} onChange={setSort} options={DEMO_METRICS} />
      </div>

      <ChartCard
        title={`Evolução diária de ${metric.label.toLowerCase()} por gênero`}
        subtitle="Linha do tempo Feminino × Masculino"
      >
        {trend.length ? (
          <TrendChart
            data={trend}
            height={300}
            series={[
              { key: "female", name: "Feminino", color: GENDER_COLORS.female, type: "line", format: metric.format },
              { key: "male", name: "Masculino", color: GENDER_COLORS.male, type: "line", format: metric.format },
            ]}
          />
        ) : (
          <EmptyState />
        )}
      </ChartCard>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          title={`${metric.label} por faixa etária`}
          subtitle="Distribuição por idade"
          className="xl:col-span-2"
        >
          {ageBars.length ? (
            <HorizontalBar data={[...ageBars].reverse()} format={metric.format} colored />
          ) : (
            <EmptyState />
          )}
        </ChartCard>

        <ChartCard title={`${metric.label} por gênero`} subtitle="Participação demográfica">
          {genderDonut.length ? <DonutChart data={genderDonut} format={metric.format} /> : <EmptyState />}
        </ChartCard>
      </div>

      <ChartCard title={`Gênero por faixa etária`} subtitle={`Barras emparelhadas — ${metric.label.toLowerCase()}`}>
        {paired.length ? (
          <GroupedBar
            data={paired}
            format={metric.format}
            series={[
              { key: "female", name: "Feminino", color: GENDER_COLORS.female },
              { key: "male", name: "Masculino", color: GENDER_COLORS.male },
            ]}
          />
        ) : (
          <EmptyState />
        )}
      </ChartCard>
    </div>
  );
}
