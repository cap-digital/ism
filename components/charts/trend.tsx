"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { IsmTooltip } from "./chart-tooltip";
import { fmtCompact } from "@/lib/format";

const AXIS = { fill: "#103F1Daa", fontSize: 11 } as const;

export interface TrendSeries {
  key: string;
  name: string;
  color: string;
  type?: "area" | "line";
  format?: (v: number) => string;
}

export function TrendChart({
  data,
  series,
  height = 300,
}: {
  data: Array<Record<string, string | number>>;
  series: TrendSeries[];
  height?: number;
}) {
  const fmtMap = Object.fromEntries(
    series.map((s) => [s.name, s.format ?? ((v: number) => fmtCompact(v))]),
  );
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 16, left: 4, bottom: 4 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} stroke="#103F1D11" />
        <XAxis
          dataKey="name"
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          width={44}
          tickFormatter={(v) => fmtCompact(v)}
        />
        <Tooltip
          content={(p) => (
            <IsmTooltip {...p} valueFormat={(v, name) => (fmtMap[name] ?? fmtCompact)(v)} />
          )}
        />
        {series.length > 1 && (
          <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        )}
        {series.map((s) =>
          s.type === "line" ? (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ) : (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2.5}
              fill={`url(#grad-${s.key})`}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ),
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
