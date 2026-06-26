"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { IsmTooltip } from "./chart-tooltip";
import { fmtCompact } from "@/lib/format";

const AXIS = { fill: "#103F1Daa", fontSize: 12 } as const;

export interface SeriesDef {
  key: string;
  name: string;
  color: string;
}

/** Grouped / paired vertical bars: one cluster per row, one bar per series. */
export function GroupedBar({
  data,
  series,
  format,
  height = 300,
  stacked = false,
}: {
  data: Array<Record<string, string | number>>;
  series: SeriesDef[];
  format: (v: number) => string;
  height?: number;
  stacked?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 16, right: 12, left: 4, bottom: 4 }} barGap={4}>
        <CartesianGrid vertical={false} stroke="#103F1D11" />
        <XAxis dataKey="name" tick={AXIS} tickLine={false} axisLine={false} interval={0} />
        <YAxis
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          width={44}
          tickFormatter={(v) => fmtCompact(v)}
        />
        <Tooltip
          cursor={{ fill: "#2E9E3F0f" }}
          content={(p) => <IsmTooltip {...p} valueFormat={(v) => format(v)} />}
        />
        <Legend
          iconType="circle"
          iconSize={9}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            fill={s.color}
            radius={stacked ? (i === series.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]) : [6, 6, 0, 0]}
            stackId={stacked ? "a" : undefined}
            maxBarSize={48}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
