"use client";

import { useMemo } from "react";
import { PlayCircle, Film, Percent, Flag } from "lucide-react";
import { useData } from "@/components/data-provider";
import { PageGate } from "@/components/states";
import { KpiCard } from "@/components/ui/kpi-card";
import { ChartCard, EmptyState } from "@/components/ui/card";
import { VideoFunnel } from "@/components/charts/video-funnel";
import { GroupedBar } from "@/components/charts/grouped-bars";
import { DonutChart } from "@/components/charts/donut";
import { accumulate, groupBy } from "@/lib/aggregate";
import { BRAND_COLORS, ISM, PALETTE } from "@/lib/constants";
import { fmtCompact, fmtPct } from "@/lib/format";

export default function VideoPage() {
  return (
    <PageGate>
      <Content />
    </PageGate>
  );
}

function Content() {
  const { rows } = useData();
  const t = useMemo(() => accumulate(rows), [rows]);

  const hasVideo = t.v25 + t.vtp + t.v100 > 0;

  const stages = useMemo(
    () => [
      { label: "ThruPlay", value: t.vtp },
      { label: "25%", value: t.v25 },
      { label: "50%", value: t.v50 },
      { label: "75%", value: t.v75 },
      { label: "100%", value: t.v100 },
    ],
    [t],
  );

  const retentionByBrand = useMemo(
    () =>
      groupBy(rows, (r) => r.marca)
        .filter((b) => b.totals.v25 > 0)
        .sort((a, b) => b.totals.v25 - a.totals.v25)
        .map((b) => ({
          name: b.key,
          "25%": b.totals.v25,
          "50%": b.totals.v50,
          "75%": b.totals.v75,
          "100%": b.totals.v100,
        })),
    [rows],
  );

  const thruplayDonut = useMemo(
    () =>
      groupBy(rows, (r) => r.marca)
        .filter((b) => b.totals.vtp > 0)
        .map((b, i) => ({ name: b.key, value: b.totals.vtp, color: BRAND_COLORS[b.key] ?? PALETTE[i % PALETTE.length] }))
        .sort((a, b) => b.value - a.value),
    [rows],
  );

  const completion = t.v25 > 0 ? t.v100 / t.v25 : 0;
  const hook = t.impressions > 0 ? t.v25 / t.impressions : 0;
  const midRetention = t.v25 > 0 ? t.v50 / t.v25 : 0;

  if (!hasVideo) {
    return <EmptyState label="Não há dados de vídeo para os filtros atuais." />;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="ThruPlays" value={fmtCompact(t.vtp)} icon={PlayCircle} accent="green" sub="reproduções qualificadas" />
        <KpiCard label="Views 25%" value={fmtCompact(t.v25)} icon={Film} accent="gold" sub="início de retenção" />
        <KpiCard label="Taxa de conclusão" value={fmtPct(completion, 1)} icon={Flag} accent="green" sub="100% / 25%" />
        <KpiCard label="Hook rate" value={fmtPct(hook, 2)} icon={Percent} accent="red" sub="25% / impressões" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Funil de retenção de vídeo" subtitle="Quartis de visualização" className="xl:col-span-2">
          <VideoFunnel stages={stages} />
          <div className="mx-4 mt-2 flex items-center gap-2 rounded-2xl bg-ism-green/[0.05] px-4 py-3 text-sm text-ism-green-900/70">
            <span className="font-semibold text-ism-green-700">Retenção no meio:</span>
            {fmtPct(midRetention, 0)} dos espectadores que iniciam chegam a 50% do vídeo.
          </div>
        </ChartCard>

        <ChartCard title="ThruPlays por marca" subtitle="Participação nas reproduções">
          {thruplayDonut.length ? <DonutChart data={thruplayDonut} format={fmtCompact} /> : <EmptyState />}
        </ChartCard>
      </div>

      <ChartCard title="Retenção por marca" subtitle="Visualizações por quartil — barras emparelhadas">
        {retentionByBrand.length ? (
          <GroupedBar
            data={retentionByBrand}
            format={fmtCompact}
            series={[
              { key: "25%", name: "25%", color: "#7BC86C" },
              { key: "50%", name: "50%", color: ISM.green },
              { key: "75%", name: "75%", color: "#1E7A30" },
              { key: "100%", name: "100%", color: ISM.green900 },
            ]}
          />
        ) : (
          <EmptyState />
        )}
      </ChartCard>
    </div>
  );
}
