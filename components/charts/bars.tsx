"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import { PALETTE } from "@/lib/constants";
import { fmtCompact } from "@/lib/format";

export interface BarDatum {
  name: string;
  value: number;
  color?: string;
}

const AXIS = { fill: "#103F1Daa", fontSize: 12 } as const;

function Tip({ format }: { format: (v: number) => string }) {
  return function Inner({ active, payload }: Partial<TooltipContentProps>) {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    const name = (d.payload as BarDatum)?.name ?? d.name;
    return (
      <div className="rounded-2xl border border-ism-green/10 bg-white/95 px-3.5 py-2 shadow-float">
        <div className="text-xs font-semibold text-ism-green-900">{name}</div>
        <div className="text-xs text-ism-green-900/60">
          {format(Number(d.value))}
        </div>
      </div>
    );
  };
}

export function VerticalBar({
  data,
  format,
  height = 280,
  colored = false,
}: {
  data: BarDatum[];
  format: (v: number) => string;
  height?: number;
  colored?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 16, right: 12, left: 4, bottom: 4 }}>
        <CartesianGrid vertical={false} stroke="#103F1D11" />
        <XAxis
          dataKey="name"
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          interval={0}
        />
        <YAxis
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          width={44}
          tickFormatter={(v) => fmtCompact(v)}
        />
        <Tooltip cursor={{ fill: "#2E9E3F0f" }} content={Tip({ format })} />
        <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={56}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.color || (colored ? PALETTE[i % PALETTE.length] : "#2E9E3F")}
            />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            formatter={(v) => fmtCompact(Number(v))}
            style={{ fill: "#103F1D88", fontSize: 11, fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HorizontalBar({
  data,
  format,
  height,
  colored = false,
}: {
  data: BarDatum[];
  format: (v: number) => string;
  height?: number;
  colored?: boolean;
}) {
  const h = height ?? Math.max(160, data.length * 38 + 24);
  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 4, right: 56, left: 4, bottom: 4 }}
      >
        <CartesianGrid horizontal={false} stroke="#103F1D11" />
        <XAxis
          type="number"
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => fmtCompact(v)}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          width={130}
          interval={0}
        />
        <Tooltip cursor={{ fill: "#2E9E3F0f" }} content={Tip({ format })} />
        <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={28}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.color || (colored ? PALETTE[i % PALETTE.length] : "#2E9E3F")}
            />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            formatter={(v) => format(Number(v))}
            style={{ fill: "#103F1D99", fontSize: 11, fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
