"use client";

import { useMemo, useState } from "react";
import { useData } from "@/components/data-provider";
import { PageGate } from "@/components/states";
import { ChartCard, EmptyState } from "@/components/ui/card";
import { MetricSelect } from "@/components/ui/metric-select";
import { DonutChart } from "@/components/charts/donut";
import { VerticalBar } from "@/components/charts/bars";
import { GroupedBar } from "@/components/charts/grouped-bars";
import { Heatmap, type HeatCell } from "@/components/charts/heatmap";
import {
  emptyTotals,
  METRICS,
  type MetricKey,
  type Totals,
} from "@/lib/aggregate";
import { GENDER_COLORS, ISM } from "@/lib/constants";
import { fmtCompact, GENDER_LABEL } from "@/lib/format";
import type { Row } from "@/lib/types";

const AGE_ORDER = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+", "Unknown"];
const GENDERS = ["female", "male", "unknown"];
const HEAT_METRICS: MetricKey[] = ["reach", "impressions", "investimento", "engagement"];

function add(t: Totals, r: Row) {
  t.investimento += r.investimento;
  t.impressions += r.impressions;
  t.clicks += r.clicks;
  t.reach += r.reach;
  t.engagement += r.engagement;
}

export default function DemografiaPage() {
  return (
    <PageGate>
      <Content />
    </PageGate>
  );
}

function Content() {
  const { rows } = useData();
  const [heatMetric, setHeatMetric] = useState<MetricKey>("reach");
  const metric = METRICS[heatMetric];

  const { ages, cells } = useMemo(() => {
    const grid = new Map<string, Totals>();
    const ageSet = new Set<string>();
    for (const r of rows) {
      ageSet.add(r.age);
      const k = `${r.age}__${r.gender}`;
      let t = grid.get(k);
      if (!t) { t = emptyTotals(); grid.set(k, t); }
      add(t, r);
    }
    const ages = AGE_ORDER.filter((a) => ageSet.has(a));
    const cells: HeatCell[] = [];
    for (const a of ages)
      for (const g of GENDERS) {
        const t = grid.get(`${a}__${g}`);
        cells.push({ row: a, col: GENDER_LABEL[g], value: t ? metric.value(t) : 0 });
      }
    return { ages, cells };
  }, [rows, metric]);

  const ageBars = useMemo(() => {
    const m = new Map<string, Totals>();
    for (const r of rows) {
      let t = m.get(r.age);
      if (!t) { t = emptyTotals(); m.set(r.age, t); }
      add(t, r);
    }
    return AGE_ORDER.filter((a) => m.has(a)).map((a) => ({
      name: a,
      value: m.get(a)!.reach,
    }));
  }, [rows]);

  const genderDonut = useMemo(() => {
    const m = new Map<string, Totals>();
    for (const r of rows) {
      let t = m.get(r.gender);
      if (!t) { t = emptyTotals(); m.set(r.gender, t); }
      add(t, r);
    }
    return [...m.entries()]
      .map(([g, t]) => ({ name: GENDER_LABEL[g] ?? g, value: t.reach, color: GENDER_COLORS[g] ?? ISM.green }))
      .sort((a, b) => b.value - a.value);
  }, [rows]);

  const paired = useMemo(() => {
    const m = new Map<string, { female: number; male: number; unknown: number }>();
    for (const r of rows) {
      let e = m.get(r.age);
      if (!e) { e = { female: 0, male: 0, unknown: 0 }; m.set(r.age, e); }
      if (r.gender === "female") e.female += r.reach;
      else if (r.gender === "male") e.male += r.reach;
      else e.unknown += r.reach;
    }
    return AGE_ORDER.filter((a) => m.has(a)).map((a) => ({ name: a, ...m.get(a)! }));
  }, [rows]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          title="Mapa de calor · Idade × Gênero"
          subtitle={`Intensidade por ${metric.label.toLowerCase()}`}
          className="xl:col-span-2"
          action={<MetricSelect value={heatMetric} onChange={setHeatMetric} options={HEAT_METRICS} />}
        >
          {ages.length ? (
            <Heatmap
              rows={ages}
              cols={GENDERS.map((g) => GENDER_LABEL[g])}
              cells={cells}
              format={metric.format}
              rowLabel="Idade"
              colLabel="Gênero"
            />
          ) : (
            <EmptyState />
          )}
        </ChartCard>

        <ChartCard title="Alcance por gênero" subtitle="Participação demográfica">
          {genderDonut.length ? (
            <DonutChart data={genderDonut} format={fmtCompact} />
          ) : (
            <EmptyState />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Alcance por faixa etária" subtitle="Distribuição por idade">
          {ageBars.length ? <VerticalBar data={ageBars} format={fmtCompact} colored /> : <EmptyState />}
        </ChartCard>

        <ChartCard title="Gênero por faixa etária" subtitle="Barras emparelhadas — alcance">
          {paired.length ? (
            <GroupedBar
              data={paired}
              format={fmtCompact}
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
    </div>
  );
}
