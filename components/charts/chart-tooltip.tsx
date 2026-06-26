"use client";

import type { TooltipContentProps } from "recharts";

export function IsmTooltip({
  active,
  payload,
  label,
  valueFormat,
}: Partial<TooltipContentProps> & {
  valueFormat?: (v: number, name: string) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-2xl border border-ism-green/10 bg-white/95 px-3.5 py-2.5 shadow-float backdrop-blur">
      {label != null && (
        <div className="mb-1 text-xs font-semibold text-ism-green-900">
          {String(label)}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: (p.color as string) || "#2E9E3F" }}
            />
            <span className="text-ism-green-900/60">{p.name}</span>
            <span className="ml-auto font-semibold tabular-nums text-ism-green-900">
              {valueFormat
                ? valueFormat(Number(p.value), String(p.name))
                : Number(p.value).toLocaleString("pt-BR")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
