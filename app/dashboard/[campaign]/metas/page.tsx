"use client";

import { useMemo, useState } from "react";
import { DollarSign, Eye } from "lucide-react";
import { useData } from "@/components/data-provider";
import { PageGate } from "@/components/states";
import { KpiCard } from "@/components/ui/kpi-card";
import { ChartCard, Card, EmptyState } from "@/components/ui/card";
import { GroupedBar } from "@/components/charts/grouped-bars";
import { accumulate, groupBy } from "@/lib/aggregate";
import { BRAND_COLORS, ISM } from "@/lib/constants";
import type { Row } from "@/lib/types";
import {
  fmtCompact,
  fmtCurrency,
  fmtPct,
  monthFromISO,
  monthRank,
  titleCase,
} from "@/lib/format";
import { metaMonths, metaBrands, sumMetas } from "@/lib/metas";

/** Mês da linha: usa a coluna "Mês" (Always ON) ou deriva da data (Geo). */
const rowMonth = (r: Row) => r.mes || monthFromISO(r.date);

export default function MetasPage() {
  return (
    <PageGate>
      <Content />
    </PageGate>
  );
}

type ChartMetric = "investimento" | "impressoes";

function Content() {
  const { rows, type, filters, dateRange } = useData();
  const [chartMetric, setChartMetric] = useState<ChartMetric>("investimento");

  const goalMonths = metaMonths(type);
  const goalBrands = metaBrands(type);

  // O "planejado" acompanha os filtros ativos para bater com o "executado"
  // (que vem das linhas já filtradas). Chips de mês têm prioridade; um intervalo
  // personalizado limita aos meses presentes nas linhas; sem período, usa todos.
  const scopeMonths = useMemo(() => {
    if (filters.mes.length) return filters.mes.filter((m) => goalMonths.includes(m));
    if (dateRange.from || dateRange.to) {
      const present = new Set(rows.map(rowMonth));
      return goalMonths.filter((m) => present.has(m));
    }
    return goalMonths;
  }, [filters.mes, dateRange, rows, goalMonths]);

  const scopeBrands = useMemo(
    () =>
      filters.marca.length
        ? filters.marca.filter((b) => goalBrands.includes(b))
        : goalBrands,
    [filters.marca, goalBrands],
  );

  const planned = useMemo(
    () => sumMetas(type, scopeMonths, scopeBrands),
    [type, scopeMonths, scopeBrands],
  );
  const executed = useMemo(() => accumulate(rows), [rows]);

  const invPct = planned.investimento > 0 ? executed.investimento / planned.investimento : 0;
  const imprPct = planned.impressoes > 0 ? executed.impressions / planned.impressoes : 0;

  const byBrand = useMemo(() => {
    const execMap = new Map(
      groupBy(rows, (r) => r.marca).map((b) => [b.key, b.totals]),
    );
    return scopeBrands
      .map((brand) => {
        const plan = sumMetas(type, scopeMonths, [brand]);
        const ex = execMap.get(brand);
        return {
          brand,
          planInv: plan.investimento,
          exInv: ex?.investimento ?? 0,
          planImpr: plan.impressoes,
          exImpr: ex?.impressions ?? 0,
        };
      })
      .sort((a, b) => b.planInv - a.planInv);
  }, [rows, type, scopeMonths, scopeBrands]);

  const isInv = chartMetric === "investimento";
  const chartData = useMemo(
    () =>
      byBrand.map((b) => ({
        name: b.brand,
        Meta: isInv ? b.planInv : b.planImpr,
        Realizado: isInv ? b.exInv : b.exImpr,
      })),
    [byBrand, isInv],
  );

  // Detalhamento por mês (apenas quando há mais de um mês no escopo).
  const byMonth = useMemo(() => {
    if (scopeMonths.length < 2) return null;
    return [...scopeMonths]
      .sort((a, b) => monthRank(a) - monthRank(b))
      .map((month) => {
        const plan = sumMetas(type, [month], scopeBrands);
        const ex = accumulate(rows.filter((r) => rowMonth(r) === month));
        return {
          month,
          planInv: plan.investimento,
          exInv: ex.investimento,
          planImpr: plan.impressoes,
          exImpr: ex.impressions,
        };
      });
  }, [rows, type, scopeMonths, scopeBrands]);

  if (!scopeMonths.length || planned.investimento === 0) {
    return (
      <Card className="px-6 py-16 text-center text-sm text-ism-green-900/50">
        Nenhuma meta contratada para os filtros atuais.
      </Card>
    );
  }

  const scopeLabel = `${scopeMonths.length} ${scopeMonths.length === 1 ? "mês" : "meses"} · ${scopeBrands.length} ${scopeBrands.length === 1 ? "marca" : "marcas"}`;

  return (
    <div className="space-y-5">
      {/* KPIs — planejado vs. executado */}
      <div className="grid gap-4 sm:grid-cols-2">
        <KpiCard
          label="Investimento executado"
          value={fmtCurrency(executed.investimento)}
          icon={DollarSign}
          accent="green"
          sub={`${fmtPct(invPct, 0)} da meta · ${scopeLabel}`}
          progress={{ pct: invPct, label: `Meta ${fmtCurrency(planned.investimento)}` }}
          highlightComplete
        />
        <KpiCard
          label="Impressões executadas"
          value={fmtCompact(executed.impressions)}
          icon={Eye}
          accent="gold"
          sub={`${fmtPct(imprPct, 0)} da meta · ${scopeLabel}`}
          progress={{ pct: imprPct, label: `Meta ${fmtCompact(planned.impressoes)}` }}
          highlightComplete
        />
      </div>

      {/* Planejado × Executado por marca */}
      <ChartCard
        title={`${isInv ? "Investimento" : "Impressões"} por marca`}
        subtitle="Meta contratada × realizado"
        action={
          <MetricToggle value={chartMetric} onChange={setChartMetric} />
        }
      >
        {chartData.length ? (
          <GroupedBar
            data={chartData}
            format={isInv ? fmtCurrency : fmtCompact}
            series={[
              { key: "Meta", name: "Meta", color: ISM.gold },
              { key: "Realizado", name: "Realizado", color: ISM.green },
            ]}
          />
        ) : (
          <EmptyState />
        )}
      </ChartCard>

      {/* Tabela por marca */}
      <Card className="overflow-hidden">
        <div className="px-5 pt-5">
          <h3 className="text-[15px] font-semibold text-ism-green-900">Progresso por marca</h3>
          <p className="mt-0.5 text-xs text-ism-green-900/50">
            Planejado vs. executado no período selecionado
          </p>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-y border-ism-green/10 bg-ism-green/[0.03] text-left text-xs uppercase tracking-wide text-ism-green-900/45">
                <th className="py-2.5 pl-5 font-medium">Marca</th>
                <th className="py-2.5 text-right font-medium">Meta invest.</th>
                <th className="py-2.5 text-right font-medium">Realizado</th>
                <th className="py-2.5 text-right font-medium">%</th>
                <th className="py-2.5 text-right font-medium">Meta impr.</th>
                <th className="py-2.5 text-right font-medium">Realizado</th>
                <th className="py-2.5 pr-5 text-right font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {byBrand.map((b) => (
                <tr key={b.brand} className="border-b border-ism-green/5 hover:bg-ism-green/[0.03]">
                  <td className="py-3 pl-5">
                    <span className="inline-flex items-center gap-2 font-semibold text-ism-green-900">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: BRAND_COLORS[b.brand] ?? ISM.green }} />
                      {b.brand}
                    </span>
                  </td>
                  <Cell>{fmtCurrency(b.planInv)}</Cell>
                  <Cell>{fmtCurrency(b.exInv)}</Cell>
                  <PctCell pct={b.planInv > 0 ? b.exInv / b.planInv : 0} />
                  <Cell>{fmtCompact(b.planImpr)}</Cell>
                  <Cell>{fmtCompact(b.exImpr)}</Cell>
                  <PctCell pct={b.planImpr > 0 ? b.exImpr / b.planImpr : 0} className="pr-5" />
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-ism-green/10 bg-ism-green/[0.03] font-semibold text-ism-green-900">
                <td className="py-3 pl-5">Total</td>
                <Cell>{fmtCurrency(planned.investimento)}</Cell>
                <Cell>{fmtCurrency(executed.investimento)}</Cell>
                <PctCell pct={invPct} />
                <Cell>{fmtCompact(planned.impressoes)}</Cell>
                <Cell>{fmtCompact(executed.impressions)}</Cell>
                <PctCell pct={imprPct} className="pr-5" />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Detalhamento por mês */}
      {byMonth && (
        <Card className="overflow-hidden">
          <div className="px-5 pt-5">
            <h3 className="text-[15px] font-semibold text-ism-green-900">Progresso por mês</h3>
            <p className="mt-0.5 text-xs text-ism-green-900/50">Metas contratadas por mês</p>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-y border-ism-green/10 bg-ism-green/[0.03] text-left text-xs uppercase tracking-wide text-ism-green-900/45">
                  <th className="py-2.5 pl-5 font-medium">Mês</th>
                  <th className="py-2.5 text-right font-medium">Meta invest.</th>
                  <th className="py-2.5 text-right font-medium">Realizado</th>
                  <th className="py-2.5 text-right font-medium">%</th>
                  <th className="py-2.5 text-right font-medium">Meta impr.</th>
                  <th className="py-2.5 text-right font-medium">Realizado</th>
                  <th className="py-2.5 pr-5 text-right font-medium">%</th>
                </tr>
              </thead>
              <tbody>
                {byMonth.map((m) => (
                  <tr key={m.month} className="border-b border-ism-green/5 hover:bg-ism-green/[0.03]">
                    <td className="py-3 pl-5 font-semibold text-ism-green-900">{titleCase(m.month)}</td>
                    <Cell>{fmtCurrency(m.planInv)}</Cell>
                    <Cell>{fmtCurrency(m.exInv)}</Cell>
                    <PctCell pct={m.planInv > 0 ? m.exInv / m.planInv : 0} />
                    <Cell>{fmtCompact(m.planImpr)}</Cell>
                    <Cell>{fmtCompact(m.exImpr)}</Cell>
                    <PctCell pct={m.planImpr > 0 ? m.exImpr / m.planImpr : 0} className="pr-5" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function MetricToggle({
  value,
  onChange,
}: {
  value: ChartMetric;
  onChange: (v: ChartMetric) => void;
}) {
  const opts: { key: ChartMetric; label: string }[] = [
    { key: "investimento", label: "Investimento" },
    { key: "impressoes", label: "Impressões" },
  ];
  return (
    <div className="flex rounded-full border border-ism-green/15 bg-white p-0.5">
      {opts.map((o) => {
        const on = o.key === value;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              on
                ? "bg-ism-green text-white"
                : "text-ism-green-900/60 hover:text-ism-green-900"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Cell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`py-3 text-right font-medium tabular-nums text-ism-green-900/80 ${className}`}>{children}</td>;
}

function PctCell({ pct, className = "" }: { pct: number; className?: string }) {
  const done = pct >= 1;
  return (
    <td className={`py-3 text-right font-semibold tabular-nums ${done ? "text-ism-green-700" : "text-ism-green-900/60"} ${className}`}>
      {fmtPct(pct, 0)}
    </td>
  );
}
