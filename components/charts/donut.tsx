"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PALETTE } from "@/lib/constants";

export interface Slice {
  name: string;
  value: number;
  color?: string;
}

export function DonutChart({
  data,
  format,
  centerLabel,
  centerValue,
  height = 240,
}: {
  data: Slice[];
  format: (v: number) => string;
  centerLabel?: string;
  centerValue?: string;
  height?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col items-center gap-4 px-3 sm:flex-row">
      <div className="relative" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color || PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <div className="rounded-2xl border border-ism-green/10 bg-white/95 px-3.5 py-2 shadow-float">
                    <div className="text-xs font-semibold text-ism-green-900">
                      {payload[0].name}
                    </div>
                    <div className="text-xs text-ism-green-900/60">
                      {format(payload[0].value as number)} ·{" "}
                      {total > 0
                        ? (((payload[0].value as number) / total) * 100)
                            .toFixed(1)
                            .replace(".", ",")
                        : 0}
                      %
                    </div>
                  </div>
                ) : null
              }
            />
          </PieChart>
        </ResponsiveContainer>
        {(centerValue || centerLabel) && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            {centerValue && (
              <span className="text-xl font-semibold tracking-tight text-ism-green-900">
                {centerValue}
              </span>
            )}
            {centerLabel && (
              <span className="text-[11px] uppercase tracking-wide text-ism-green-900/45">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>

      <ul className="grid w-full flex-1 gap-1.5">
        {data.map((d, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ background: d.color || PALETTE[i % PALETTE.length] }}
            />
            <span className="truncate text-ism-green-900/70">{d.name}</span>
            <span className="ml-auto shrink-0 font-semibold tabular-nums text-ism-green-900">
              {format(d.value)}
            </span>
            <span className="w-12 shrink-0 text-right text-xs tabular-nums text-ism-green-900/40">
              {total > 0
                ? ((d.value / total) * 100).toFixed(0)
                : 0}
              %
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
